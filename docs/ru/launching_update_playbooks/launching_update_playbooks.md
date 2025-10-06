# {heading(Запуск плейбуков обновления)[id=launching_update_playbooks]}

## {heading(Подготовка)[id=launching_update_playbooks_preparation]}

Скопируйте директорию с Ansible-плейбуками в Inventory:

```console
$ cp -r $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/ansible-openstack ~/inventory-$NEW_RELEASE_NAME
```

## {heading(Запуск обновления с помощью скрипта box.sh)[id=launching_update_playbooks_box]}

### {heading(Запуск скрипта box.sh с группой upgrade)[id=box_upgrade]}

Чтобы запустить скрипт `box.sh` с группой `upgrade`:

1. Перейдите в каталог со сгенерированным Inventory и скопируйте файл `upgrade-*` со списком плейбуков обновлений:

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ cd ~/inventory-$NEW_RELEASE_NAME/vkcloud
   $ cp ../tools/box.sh.d/groups/upgrade-4.1.1-4.2.1-full ../tools/box.sh.d/groups/upgrade
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $ cd ~/inventory-$NEW_RELEASE_NAME/vkcloud
   $ cp ../tools/box.sh.d/groups/upgrade-4.2.0-4.2.1-full ../tools/box.sh.d/groups/upgrade
   ```
   {/caption}

   {note:err}

   Файл `../tools/box.sh.d/groups/upgrade` может содержать компоненты, которые не используются в инсталляции, закомментируйте их.

   Плейбук `zabbix_configure_resources.yml|-e zabbix_api4ansible=true|redos` выполните в конце всех обновлений, в группе `postdeploy`:

   ```console
   $ ansible-playbook -i vkcloud.yml -e env=vkcloud -e zabbix_api4ansible=true ../ansible-openstack/playbooks/zabbix_configure_resources.yml
   ```

   {/note}

1. Если в инсталляции {var(sys2)} используется программный роутер, для безопасного обновления Neutron на сетевых узлах:

   1. Запустите плейбук `playbooks/neutron-network-deploy.yml`, с указанием параметра `--limit` и перечислением узлов, с которых перемещены все роутеры на другие сетевые узлы (подробнее — в разделе {linkto(../migration#migration_network)[text=%text]}).
   1. Перезапустите сервисы Neutron на обновленных узлах (`neutron-l3-agent`,`neutron-dhcp-agent`, `neutron-metadata-agent`, `neutron-openvswitch-agent`).
   1. Дождитесь завершения Full Sync Neutron L3 агента. Проверьте, что в логах L3 агента есть сообщение `FullsyncL3: Stop sync successed`).
   1. Повторите шаги по перемещению роутеров на обновленные сетевые узлы.
   1. Запустите плейбук на остальных сетевых узлах.

1. Запустите обновление:

   ```console
   $ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e distro_deploy=true -e env=vkcloud
   ```

1. После обновления Cinder перезагрузите гипервизоры с High-IOPS дисками и продолжите обновление с `cinder-volume-deploy.yml|-e bootstrap=true|redos`:

   ```console
   $ ansible-playbook -i vkcloud.yml -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/cinder-volume-deploy.yml
   ```

   {note:err}

   Перед перезагрузкой гипервизоров с High-IOPS убедитесь, что диски не подключены к ВМ (или ВМ находятся в статусе `SHUTOFF`). Иначе диск станет недоступен на момент перезагрузки, что может вызвать зависание ВМ.

   {/note}

   1. Выполните перезагрузку узлов из группы `vkcloud_scst_iscsi` в Inventory-файле `vkcloud.yml`. Убедитесь, что ОС загрузилась без ошибок:

      ```console
      $ ssh <ИМЯ_УЗЛА>
      $ sudo shutdown -r now
      $ systemctl status | head -n 5
      $ systemctl list-units --failed
      ```

   1. Убедитесь, что модули ядра загружены, а пакеты установлены:

      ```console
      $ lsmod | grep iscsi
      iscsi_scst           126976   3
      scst                 3653632  2 scst_vdisk,iscsi_scst
      $ rpm -qa | grep scst-kmod
      scst-kmod_6.1.52-1.el7.3.x86_64-3.7.0-109.el7.x86_64
      scst-kmod_6.1.110-1.el7.3.x86_64-3.7.0-117.el7.x86_64
      ```

В группе `upgrade-*-full` собраны все обязательные плейбуки для обновления. Чтобы выполнить полное обновление, запустите плейбук:

```console
$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e distro_deploy=true -e env=vkcloud
```

### {heading(Запуск скрипта box.sh для полной установки)[id=box_full]}

Чтобы выполнить полную установку, запустите плейбук:

```console
$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -e distro_deploy=true -e env=vkcloud
```

Если есть файлы с дополнительными переменными, добавьте их при запуске обновления, например:

```console
$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -e @/home/centos/corpcloud_vars.yml -e @/home/centos/saved_passwords/certs -e distro_deploy=true -e env=vkcloud -s base
```

### {heading(Устранение неполадок)[id=launching_update_playbooks_problem]}

#### {heading(Добавление Zabbix-узлов)[id=problem_zabbix_add]}

**Проблема**: При выполнении плейбука `zabbix_configure_resources.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [zabbix/zabbix_server : Add zabbix host] ****
...
Failed to update host cpn001: ('Error -32602: Invalid params., ...
...
```
{/caption}

**Решение**:

1. Отключите шаблон **Apache Kafka by JMX** от узла:

   1. Войдите в Портал мониторинга (Zabbix).
   1. Перейдите в раздел **Configuration** → **Hosts**.
   1. Нажмите на имя узла, на котором возникла ошибка.
   1. Перейдите на вкладку **Templates**.
   1. Напротив шаблона **Apache Kafka by JMX** нажмите **Unlink and clear**.

1. В очереди обновлений переместите запуск плейбука `zabbix_configure_resources.yml` в конец списка:

   ```console
   deploy$ vi ../tools/box.sh.d/groups/upgrade
   ...
   helm-laas-reader-api.yml||redos
   # postdeploy -
   post-deploy.yml||redos
   imageloader.yml|-t addons|redos
   xaas-add-app-to-catalog.yml||redos
   zabbix_configure_resources.yml|-e zabbix_api4ansible=true|redos
   ```

1. Запустите плейбук, стоящий в очереди до плейбука `zabbix_configure_resources.yml`.

   {caption(Пример с использованием плейбука helm-laas-reader-api.yml)[align=left;position=above]}
   ```console
   deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to helm-laas-reader-api.yml.yml
   ```
   {/caption}

#### {heading(Отладка кластеров RabbitMQ)[id=problem_rabbitmq]}

**Проблема**: Во время выполнения плейбука `rabbitmq.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [rabbitmq : Rabbitmq | Check for pod readiness] ****
...
There is no ready replicas
```
{/caption}

**Решение**: С master-узла Kubernetes удалите неготовые (`READY 0/1`) поды RabbitMQ для пересборки кластеров RabbitMQ.

{caption(Пример для трех подов)[align=left;position=above]}
```console
cpn-master$ sudo kubectl -n rabbitmq get pods | grep '0/1'
rabbitmq-barbican-0 0/1 Running 0 2d20h
rabbitmq-celery-0 0/1 Running 0 2d20h
rabbitmq-manila-0 0/1 Running 0 2d20

cpn-master$ sudo kubectl -n rabbitmq delete pods rabbitmq-barbican-0 rabbitmq-celery-0 rabbitmq-manila-0
```
{/caption}

Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to rabbitmq.yml
```

#### {heading(Отладка кластеров Rabbit-persistent)[id=problem_rabbit-persistent]}

**Проблема**: Во время выполнения плейбука `rabbit-persistent.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [rabbit-persistent : Wait until node becomes ready] ****
...
"cmd": "docker exec rabbit_persistent rabbitmqctl cluster_status --formatter json\n",
...
non-zero return code
```
{/caption}

**Решение:** Перезапустите контейнеры Rabbit-persistent на всех управляющих узлах с изменением владельца каталога:

1. Очистите данные Rabbit-persistent, чтобы запустить сборку кластера:

   ```console
   deploy$ ansible -b -i vkcloud.yml -m shell -a "docker stop rabbit_persistent; chown rabbitmq:rabbitmq -R /srv/rabbitmq_persistent/;" cpn*
   deploy$ ansible -b -i vkcloud.yml -m shell -a "docker start rabbit_persistent" cpn*
   ```
1. Через 2 минуты проверьте, что кластер собран и работает:

   ```console
   cpnX$ sudo docker exec rabbit_persistent rabbitmqctl cluster_status --formatter json | jq '.running_nodes'
   ```

   Вывод команды должен содержать все узлы кластера.

Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to rabbit-persistent.yml
```

#### {heading(Ошибки обновления MinIO)[id=minio_problem]}

**Проблема**: Во время обновления MinIO произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [minio_s3 : Minio Buckets | Set public access] ***
...
"cmd": "/usr/bin/minio-mc admin policy attach vkcloud readwrite --user=YourAccessKeyTrove",
...
minio-mc: <ERROR> Unable to make user/group policy association. This 'admin' API is not supported by server in 'mode-server-fs'.
...
non-zero return code
```
{/caption}

**Решение:** Добавьте пользователю права `readwrite`:

1. Получите учетные данные MinIO: значения переменных `MINIO_ROOT_USER` и `MINIO_ROOT_PASSWORD` в файле `/etc/default/minio` на узле мониторинга.
1. Подключитесь к веб-интерфейсу MinIO (порт `9000` на узле мониторинга) с учетными данными MinIO.
1. Перейдите на вкладку **Users**.
1. Выберите пользователя, имя которого содержится в параметре `--user` в тексте ошибки.
1. Перейдите на вкладку **Policies** и добавьте права `readwrite`.

#### {heading(Удаление тестовых проектов)[id=problem_test_project_delete]}

**Проблема**: Во время выполнения плейбука `post-deploy.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [postdeploy : include] ****
...
... 'dict object' has no attribute 'user1'
...
```
{/caption}

**Решение**: Удалите вызов тестовых проектов из Inventory, оставив только служебные:

```console
deploy$ vi group_vars/vkcloud/postdeploy.yml
prepare_user_project:
  project_mcs_co_owner:
    group_name: '{{ freeipa_users.user_mcs_co_owner.groups[0] }}'
    username: '{{ freeipa_users.user_mcs_co_owner.username }}@{{ freeipa_realm | lower }}'
    password: '{{ freeipa_users.user_mcs_co_owner.password }}'
    roles:
      - mcs_co_owner
  project_mcs_viewer:
    group_name: '{{ freeipa_users.user_mcs_viewer.groups[0] }}'
...
```

Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to post-deploy.yml
```

#### {heading(Загрузка Glance-образов)[id=problem_image_glance]}

**Проблема**: Во время выполнения плейбука `imageloader.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [imageloader : Image Loader | Create empty bare for image] ****
...
... Provided object does not match schema 'image': False is not of type 'string' ...
...
Status code was 400 and not [201, 409]: HTTP Error 400: Bad Reques
...
```
{/caption}

**Решение**: На всех управляющих узлах перезапустите сервис `openstack-glance-api`:

```console
deploy$ ansible -b -i vkcloud.yml -m shell -a "systemctl restart openstack-glance-api" cpn*
```

Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to imageloader.yml
```

#### {heading(Проблемы сети)[id=problem_network]}

**Проблема**: В случае сетевых проблем в плейбуках возникают плавающие ошибки на взаимодействие сервисов по сети (таймауты, случайные коды 5XX, ошибки скачивания, отказ в соединении и прочее).

{caption(Пример ошибок)[align=left;position=above]}
```console
Failed to create pod sandbox: rpc error: code = Unknown desc = failed to setup network for sandbox "XXX": Unauthorized
...
Failed to download packages: XXX
...
Request failed: <urlopen error [Errno 111] Connection refused>
...
Status code was -1 and not [200]: Connection failure: timed out
...
The checksum for XXX did not match
```
{/caption}

**Решение**: Перезапустите плейбук, при выполнении которого возникла ошибка. Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to <ИМЯ_ПЛЕЙБУКА>
```
Здесь `<ИМЯ_ПЛЕЙБУКА>` — имя плейбука, при выполнении которого возникла ошибка.

Если ошибка с сетью произойдет повторно, проведите диагностику проблемы: проведите аналогичные запросы вручную и просмотрите логи. Для таких ошибок нет универсального решения.

#### {heading(Обновление ошибки доверенности сертификатов)[id=problem_cert]}

**Проблема**: Во время выполнения плейбука `opensearch.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console

TASK [opensearch : Get LDAP server crt if FreeIPA (step 2)] ****
...
unable to load certificate...
```
{/caption}

**Решение**: Проверьте корректность сертификатов и ключей в Inventory:

```console
deploy$ vi group_vars/vkcloud/vars.yml
...
# CA-сертификат (при наличии)
trusted_ca_certs:
  - content: |
      -----BEGIN CERTIFICATE-----
      MIIGLTCCBBWgAwIBAgIUEEfZuV5+obXF7dnC9EkSUgMYqCAwDQYJKoZIhvcNAQEL
      BQAwgaUxCzAJBgNVBAYTAlJVMRYwFAYDVQQIDA1Sb3N0b3Ytb24tRG9uMRYwFAYD
...
# Название сертификатов сайта:
ssl_sertificate_name: self-signed-wildcard.private.infra.devmail.ru
...
deploy$ vi group_vars/vkcloud/vault.yml
...
# Корректность сертификатов и ключей сайта, а также их названия:
vault_ssl_certs:
  self-signed-wildcard.private.infra.devmail.ru: |
    -----BEGIN CERTIFICATE-----
    MIIE4zCCAssCFB+lEPtkv6r7xPU3Jwc8sVyGN6iNMA0GCSqGSIb3DQEBCwUAMIGl
    MQswCQYDVQQGEwJSVTEWMBQGA1UECAwNUm9zdG92LW9uLURvbjEWMBQGA1UEBwwN
    ...
    1Q9vy969z2VRW6vvSjdcIUBMd3BCQpvVQKom5AAIexNDg3a9p1zhAjMsoHuIfeim
    e7G1myMj6w==
    -----END CERTIFICATE-----
    -----BEGIN PRIVATE KEY-----
    MIIEogIBAAKCAQEAmsHMp3rtI3IKYUZOgCYV2ihfqz5ATjG/8cyMK7gqG3KL/nwX
    ...
    OjOP0E3q1va+wUUCbl2c99SK/QWH4Gr/bV7n58QhX0opxf0WP+PqbLezSqpDPe+z
    X8QwlIKtfHMG39PIqpC/22pYerD1xb+meNdGO7bMckiwrfSjxSk=
    -----END PRIVATE KEY-----
...
```

Дополнительно проверьте данные сертификаты/ключи на корректность:

* Сертификаты сайта должны быть wildcard (`Common name` должен быть вида `*.private.infra.devmail.ru`).
* Сертификаты являются доверенным CA (из переменной `trusted_ca_certs` или открытым).
* Сертификаты не просрочены.

Запустите обновление {var(sys2)} с начала:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud
```

#### {heading(Отладка логов в OpenSearch)[id=problem_logs]}

**Проблема**: После завершения обновления {var(sys2)}, веб-интерфейс OpenSearch работает, но логов от серверов нет.

**Решение**: В ручном режиме выполните остановку и обновление Logstash:

```console
lm001$ sudo systemctl stop logstash-lm001 (прервите команду через CTRL+C)
lm001$ ps aux | grep logstash
logstash 49647 26.3  7.5 7077280 1230532 ? SNsl Feb01 2623:53 /usr/share/logstash/jdk/bin/java ...
lm001$ sudo kill -9 49647
lm001$ sudo dnf remove logstash -y
lm001$ sudo dnf clean all
lm001$ sudo rm -f /etc/logstash/logstash-*/log4j2.properties
```
Запустите плейбук `logstash.yml`:

```console
deploy001$ ansible-playbook -i vkcloud.yml -e env=vkcloud ../ansible-openstack/playbooks/logstash.yml
```

После выполнения команды установите права на файл `.lock` (при его наличии):

```console
lm001$ sudo chown logstash. /srv/logstash/logstash-lm001/.lock
```

#### {heading(Запуск audit2.0 с самоподписанными сертификатами)[id=problem_audit]}

**Проблема**: Во время выполнения плейбука `helm-audit-admin.yml` произошла ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
TASK [helm-chart-installer : Helm | Print k8s failed pods log from async task] ****
...
... x509: certificate relies on legacy Common Name field, use SANs instead
...
```
{/caption}

**Решение**: Проверьте, что значение параметра `X509v3 Subject Alternative Name` сертификата заполнено:

```console
any$ openssl x509 -in <СЕРТИФИКАТ>.crt -text -noout
...
X509v3 Subject Alternative Name:
    DNS:*.private.infra.devmail.ru, DNS:private.infra.devmail.ru
...
```
Здесь `<СЕРТИФИКАТ>` — сертификат из переменной `vault_ssl_certs`.

Если значения нет, перезакажите сертификат, оформив записи в Subject Alternative Name. Поместите новый сертификат в переменную `vault_ssl_certs` и запустите плейбуки `*_haproxy.yml` для его применения:

```console
deploy$ ansible-playbook -i vkcloud.yml -e env=vkcloud ../ansible-openstack/playbooks/public_haproxy.yml
deploy$ ansible-playbook -i vkcloud.yml -e env=vkcloud ../ansible-openstack/playbooks/private_haproxy.yml
```

Продолжите обновление с момента появления ошибки, перезапустив команды с ключом `--skip-to`:

```console
deploy$ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e env=vkcloud --skip-to helm-audit-admin.yml
```

#### {heading(Не создаeтся кластер Kubernetes)[id=problem_k8s]}

**Проблема**: Не создается кластер Kubernetes. При диагностике появляется ошибка.

{caption(Пример ошибки)[align=left;position=above]}
```console
PING lk17-161.private.corp.devmail.ru (10.30.6.3) 56(84) bytes of data.
64 bytes from 10.30.6.3 (10.30.6.3): icmp_seq=1 ttl=62 time=3.28 ms

--- lk.private.corp.devmail.ru ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 3.277/3.277/3.277/0.000 ms
Trying to pull repo.private.corp.devmail.ru:5010/magnum-agent:v1.3.4...
010/magnum-agent: manifest unknown
pts-user (scripts in /var/lib/cloud/instance/scripts)
init/config/cc_scripts_user.py'>) failed
```
{/caption}

**Решение**: Вручную добавьте шаблон (`cluster-template-list`), создав копию существующего шаблона. Подмените ключевые параметры для версии 4.2.2.

1. Найдите текущие шаблоны и выведите текущую информацию о данном шаблоне с управляющего узла:

   ```console
   cpnX# . ~/openrc.sh
   cpnX# magnum cluster-template-list
   +--------------------------------------+-------------------------------------------+
   | uuid                                 | name                                      |
   +--------------------------------------+-------------------------------------------+
   | 9fac7a57-cbad-4912-b1e9-cecf4d21c320 | Kubernetes-almalinux-v1.27.6-mcs.external |
   +--------------------------------------+-------------------------------------------+
   cpnX# magnum cluster-template-show 9fac7a57-cbad-4912-b1e9-cecf4d21c320
   +-----------------------+------------
   | Property              | Value
   +-----------------------+------------
   | uuid                  | 9fac7a57-cbad-4912-b1e9-cecf4d21c320
   | name                  | Kubernetes-almalinux-v1.27.6-mcs.external
   ...
   ```

   Если Kubernetes-шаблоны привязаны к проектам, добавьте OpenStack-ID проекта в каждую команду.

   {caption(Пример команды с OpenStack-ID проекта)[align=left;position=above]}
   ```console
   cpnX# magnum --os-project-id 353db9887b5a4ad783f2e5b2b535df4a cluster-template-list
   ```
   {/caption}

   Повторите действия для каждого проекта, где есть созданный Kubernetes-шаблон.

1. Для создания нового шаблона получите ID Glance-образа для кластера Kubernetes и его шаблоны конфигураций ВМ:

   ```console
   cpnX# openstack flavor list | grep Standard-2-6
   | 0aaddda5-e0ea-42b0-9e0f-6d4c2ee9df7f | Standard-2-6   |  6144 |    0 |         0 |     2 | True
   cpnX# openstack image list | grep almalinux-9-v1.27.6.202410100552.git57412380
   | 91205e2d-6b8f-4c18-9fce-7e223e456c93 | almalinux-9-v1.27.6.202410100552.git57412380     | active |
   ```

1. Получите токен пользователя `admin`:

   ```console
   cpnX# openstack token issue
   | id         | <ТОКЕН_ADMIN>
   ```

1. Заполните данные по новому шаблону:

   {note:info}

   Если до проведения обновления данные шаблона были изменены, учтите эти изменения при заполнении.

   {/note}

   {caption(Пример конфигурации в штатном состоянии {var(sys2)})[align=left;position=above]}
   ```console
   cpnX# curl -g -i -X POST http://<INTERNAL_ENDPOINT>:9511/v1/clustertemplates -H "Accept: application/json" -H "Content-Type: application/json" -H "OpenStack-API-Version: container-infra latest" -H "User-Agent: None" -H "X-Auth-Token: <ADMIN_TOKEN>" -d '{"uuid": "9fac7a57-cbad-4912-b1e9-cecf4d21c321", # +1 - чтобы получился уникальный ID
   "name": "Kubernetes-almalinux-v1.27.6.4.2-mcs.external", # Оставьте такой же или измените, чтобы их отличать в веб-интерфейсе
   "coe": "kubernetes",
   "image_id": "91205e2d-6b8f-4c18-9fce-7e223e456c93", # Изменить на найденный выше Glance-образ (шаг 4)
   "flavor_id": "0aaddda5-e0ea-42b0-9e0f-6d4c2ee9df7f",  # Изменить на найденный выше Flavor (шаг 4)
   "master_flavor_id": "0aaddda5-e0ea-42b0-9e0f-6d4c2ee9df7f", # Изменить на найденный выше Flavor (шаг 4)
   "dns_nameserver": "10.235.100.1", # Подставьте старое значение
   "keypair_id": null,
   "external_network_id": "86a305a2-f668-4fe4-bc62-0a23a4aa93ee", # Подставьте старое значение
   "fixed_network": null,
   "fixed_subnet": null,
   "network_driver": "calico",
   "apiserver_port": null,
   "docker_volume_size": null,
   "cluster_distro": "almalinux",
   "volume_driver": null,
   "registry_enabled": false,
   "labels": {
     "prometheus_monitoring": "true",
     "calico_ipv4pool": "10.100.0.0/16",
     "kube_ccm_tag": "1.27.6-mcs.2", # Поменяйте под версию 4.2.2
     "kube_autoscaler_tag": "1.27.3-mcs.3", # Поменяйте под версию 4.2.2
     "container_infra_prefix": "repo.private.corp.devmail.ru:5010/", #  Подставьте старое значение
     "use_ccm": "true",
     "kube_core_tag": "1.27.6-mcs.2", # Поменяйте под версию 4.2.2
     "task_support": "true",
     "calico_tag": "v3.26.3",
     "calico_cni_tag": "v3.26.3",
     "calico_kube_controllers_tag": "v3.26.3",
     "cinder_csi_plugin_version": "1.27.2-mcs.2", # NEW
     "kube_dashboard_version": "v2.3.1",
     "ingress_controller_tag": "v1.2.1",
     "cgroup_driver": "systemd",
     "etcd_tag": "v3.5.10",
     "config_drive": "true"
   },
   "tls_disabled": false,
   "public": true,
   "server_type": "vm",
   "insecure_registry": "true",
   "docker_storage_driver": "devicemapper",
   "master_lb_enabled": true,
   "floating_ip_enabled": true,
   "is_deprecated": false,
   "executor_image_tag": "0.0.0-202501280838.git7ca92117", # Поменяйте под версию 4.2.2
   "magnum_agent_tag": "v1.3.5"}' # Поменяйте под версию 4.2.2
   ```
   {/caption}

1. После создания шаблона в веб-интерфейсе у пользователей отобразиться две версии при попытке создать Kubernetes-кластер:

   ```console
   cpnX# magnum cluster-template-list
   WARNING: The magnum client is deprecated and will be removed in a future release.
   Use the OpenStack client to avoid seeing this message.
   +--------------------------------------+-----------------------------------------------+
   | uuid                                 | name                                          |
   +--------------------------------------+-----------------------------------------------+
   | 9fac7a57-cbad-4912-b1e9-cecf4d21c320 | Kubernetes-almalinux-v1.27.6-mcs.external     |
   | 9fac7a57-cbad-4912-b1e9-cecf4d21c321 | Kubernetes-almalinux-v1.27.6.4.2-mcs.external |
   +--------------------------------------+-----------------------------------------------+
   ```

1. Попробуйте развернуть Kubernetes-кластер из нового шаблона.

## {heading(Запуск обновления через Ansible OpenStack)[id=ansible_openstack_launching]}

Если скрипт `box.sh` отработал с ошибками, которые не получилось устранить, запустите обновление через Ansible OpenStack. Подробнее — в документе **Руководство по установке {var(system)}** в разделе **Описание скрипта установки**.

## {heading(Обновление образов ВМ)[id=ansible_openstack_launching]}

После успешного обновления {var(sys2)} доступны обновленные образы ВМ.

Чтобы исключить дублирование образов в Портале самообслуживания, деактивируйте старые образы:

1. Получите список образов:

   ```console
   # openstack image list --public
   ```

1. Деактивируйте образ:

   ```console
   # openstack image set --deactivate <ID_ОБРАЗА_ВМ>
   ```
1. Получите информацию об образе:

   ```console
   # openstack image show <ID_ОБРАЗА_ВМ>
   ```
   В выводе команды проверьте, что в параметре образа `status` указано значение `deactivated`.

{note:info}

Неактивные образы не отображаются в Портале самообслуживания. Не удаляйте такие образы.

{/note}

Для использования старых образов отредактируйте их название, чтобы не было путаницы в Портале самообслуживания:

1. Получите информацию об образе:

   ```console
   # openstack image show <ID_ОБРАЗА_ВМ>
   ```

1. Задайте образу новое имя:

   ```console
   # openstack image set --property mcs_name='<НОВОЕ_ИМЯ_ОБРАЗА_ВМ>' <ID_ОБРАЗА_ВМ>
   ```

1. Получите информацию об образе:

   ```console
   # openstack image show <ID_ОБРАЗА_ВМ>
   ```

   В выводе команды проверьте, что в параметре образа `mcs_name` указано новое имя.


