# {heading(Обновление пакетов)[id=updating_packages]}

<warn>

Выполните только при обновлении {var(system)} с версии 4.0.

</warn>

## {heading(Проверка совместимости новой версии ядра)[id=new_kernel_version_check]}

Проверьте, что новое ядро 6.1.52-1.el7.3 совместимо с используемыми серверами:

1. Выберите один сервер (кроме гипервизора с High-IOPS дисками).
1. Если требуется, переведите его в режим обслуживания согласно разделам **Руководства администратора {var(system)}**:

   * **Администрирование {var(sys2)}** → **Управление инфраструктурой, на которой развернута {var(sys1)}** → **Управление вычислительными узлами (гипервизорами)**.
   * **Администрирование {var(sys2)}** → **Управление инфраструктурой, на которой развернута {var(sys1)}** → **Операции с управляющими узлами**.

1. Установите новую версию ядра.
1. Загрузите ОС с новым ядром.

Если тестовое обновление ядра прошло успешно, переходите к следующим шагам. На остальных серверах ядро будет обновлено на шагах, описанных в разделе {linkto(#system_packages_update)[text=%text]}.

Если в {var(sys3)} используются серверы разных производителей или серверы, сильно отличающиеся по конфигурации, выполните такую проверку на каждом типе серверов, используемых в {var(sys3)}:

{caption(Пример команды проверки текущей версии ядра)[align=left;position=above]}
```console
$ uname -r
6.1.38-2.el7.3.x86_64
```
{/caption}

## {heading(Обновление системных пакетов)[id=system_packages_update]}

### {heading(Описание)[id=update_description]}

Обновление содержит следующие файлы:

* `list-packages-pre-update.yaml` — список пакетов, которые обновляются до общего обновления.
* `list-packages-auto-cve.yaml` — список пакетов с CVE уязвимостями.
* `list-packages-kernels.yaml` — список пакетов с обновлениями ядра.
* `update_os.yaml` — Ansible-плейбук, который:

   * Переподключает rpm-репозитории на новую версию Nexus.
   * Заходит на хосты из Inventory.
   * Получает список установленных пакетов.
   * Обновляет пакеты, которые стоят и есть в списках на обновление.

### {heading(Обновление)[id=update]}

1. Распакуйте входящий в состав дистрибутива архив `repos_mcs_distr_box-${NEW_RELEASE_NAME}.tar.gz`:

   ```console
   $ cd $NEW_DISTRIB_DIR
   $ tar xvf repos_mcs_distr_box-${NEW_RELEASE_NAME}.tar.gz
   ```
   
1. Перейдите в директорию `repos_mcs_distr_box-${NEW_RELEASE_NAME}/upgrade/os/ansible/`

   ```console
   $ cd repos_mcs_distr_box-${NEW_RELEASE_NAME}/upgrade/os/ansible/
   ```
   
1. Сформируйте Inventory-файл, в котором будут перечислены все серверы, требующие обновления пакетов, например `inventory.yaml`:

   ```yaml
   ---
   # Пример
   all:
     hosts:
       deploy:
         ansible_connection: local
       cpn001: {}
       cpn002: {}
       cpn003: {}
       kcn001: {}
       kcn00X: {}
       csn001: {}
       csn00X: {}
       lm001: {}
   ```
  
1. Проверьте список серверов, на которых произойдет обновление:

   ```console
   $ ansible-playbook -i inventory.yaml \
     -f 20 \
     -e env=vkcloud \
     -e ansible_python_interpreter=/usr/bin/python3 \
     -e @list-packages-auto-cve.yaml \
     -e @list-packages-pre-update.yaml \
     -e @list-packages-kernels.yaml \
     --skip-tag repos_update \
     update_os.yaml \
     --list-hosts
   ```

1. Запустите плейбук обновления пакетов:

   ```console
   $ ansible-playbook -i inventory.yaml \
     -f 20 \
     -e env=vkcloud \
     -e ansible_python_interpreter=/usr/bin/python3 \
     -e @list-packages-auto-cve.yaml \
     -e @list-packages-pre-update.yaml \
     -e @list-packages-kernels.yaml \
     --skip-tag repos_update \
     update_os.yaml
   ```
  
1. Добавьте правило `udev`, обновив `DISK_NAME_PREFIX` в соответствии с названием дисков в системе (например, `KERNEL=="sd[b-z]"`):

   ```console
   $ ssh <CEPH_SERVER_NAME>
   $ cat <<EOF | sudo tee /etc/udev/rules.d/65-disk-owner.rules
   KERNEL=="<DISK_NAME_PREFIX>[b-z]*", OWNER="ceph"
   EOF
   ```

   Здесь `<CEPH_SERVER_NAME>` — имя сервера Ceph.

1. Проверьте наличие роутеров на управляющих (Control Plane) или сетевых узлах (Network Node). Если роутеры есть, выполните их миграцию:

   <err>

   Миграция заключается в удалении роутера из одного агента и добавлении на другой агент вручную. Во время миграции обмен данными между сетями, подключенными к роутеру, будет нарушен.

   Живая миграция роутеров не поддерживается.

   Выполняйте команды для миграции роутера на узлах с установленными утилитами OpenStack (по умолчанию `cpn002` и `cpn003`).

   </err>

   1. Получите список всех L3 агентов:

      ```console
      # openstack network agent list --agent-type l3
      ```

      {caption(Пример ожидаемого результата)[align=left;position=above]}
      ```console
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | fbce1819-9e94-4550-b694-da14e00cf6f3 | L3 agent   | cpn001 | nova              | :-)   | UP    | neutron-l3-agent |
      | 7604e0c3-9ca9-484e-82a8-94930252f82e | L3 agent   | cpn002 | nova              | :-)   | UP    | neutron-l3-agent |
      | ed72b979-bc2d-490f-b059-60cd753346ef | L3 agent   | cpn003 | nova              | :-)   | UP    | neutron-l3-agent |
      | eb3577de-736a-42c5-adc5-f02b33429f07 | L3 agent   | kcn001 | nova              | :-)   | UP    | neutron-l3-agent |
      | 5a26f82b-967a-4b08-a1d1-e6c07d489127 | L3 agent   | kcn002 | nova              | :-)   | UP    | neutron-l3-agent |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      ```
      {/caption}
   
   1. Проверьте, что узлы, с которого и на который выполняется миграция, имеют режим `agent_mode=dvr_snat`:

      <err>

      Нельзя выполнять миграцию роутера на вычислительный узел с режимом `agent_mode=dvr`.

      </err>

      ```console
      # openstack network agent show <SRC_l3_ID>
      # openstack network agent show <DST_l3_ID>
      ```

      Здесь:

      * `<SRC_l3_ID>` — идентификатор L3 агента, с которого выполняется миграция.
      * `<DST_l3_ID>` — идентификатор L3 агента, на который выполняется миграция.

         {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
         ```console
         # openstack network agent show ed72b979-bc2d-490f-b059-60cd753346ef
         +-------------------+-----------------------------------------------------------------------------+
         | Field             | Value                                                                       |
         +-------------------+-----------------------------------------------------------------------------+
         | admin_state_up    | UP                                                                          |
         | agent_type        | L3 agent                                                                    |
         | alive             | :-)                                                                         |
         | availability_zone | nova                                                                        |
         | binary            | neutron-l3-agent                                                            |
         | configuration     | {'agent_mode': 'dvr_snat', 'handle_internal_only_routers': True,            |
         |                   |'external_network_bridge': '', 'gateway_external_network_id': '',            |
         |                   |'interface_driver':'neutron.agent.linux.interface.OVSInterfaceDriver',       |
         |                   |'log_agent_heartbeats': False, 'routers': 1,'ex_gw_ports': 1,'interfaces': 1,|
         |                   |'floating_ips': 0}                                                           |
         | created_at        | 2024-07-26 16:01:42                                                         |
         | description       | None                                                                        |
         | ha_state          | None                                                                        |
         | host              | cpn003                                                                      |
         | id                | ed72b979-bc2d-490f-b059-60cd753346ef                                        |
         | last_heartbeat_at | 2024-07-29 11:23:25                                                         |
         | name              | None                                                                        |
         | resources_synced  | None                                                                        |
         | started_at        | 2024-07-26 16:01:42                                                         |
         | topic             | l3_agent                                                                    |
         +-------------------+-----------------------------------------------------------------------------+
         ```
         {/caption}

   1. Получите список роутеров на L3 агенте, с которого выполняется миграция:

      ```console
      # openstack router list --agent <SRC_l3_ID>
      ```

      Здесь `<SRC_l3_ID>` — идентификатор L3 агента.

      {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
      ```console
      # openstack router list --agent fbce1819-9e94-4550-b694-da14e00cf6f3
      +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
      | ID                                   | Name   | Status | State | Project                          | Distributed | HA    |
      +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
      | f0620d62-ab42-4ff7-bbec-5e5440446517 | router | ACTIVE | UP    | ec5bd160e5ea4d8fb7ed07a099118437 | True        | False |
      +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
      ```
      {/caption}
   
   1. Проверьте, что роутер размещен на агенте, с которого будет выполнятся миграция:

      ```console
      # openstack network agent list --router <ROUTER_ID>
      ```

      Здесь `<ROUTER_ID>` — идентификатор роутера.

      {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
      ```console
      # openstack network  agent list --router f0620d62-ab42-4ff7-bbec-5e5440446517
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | fbce1819-9e94-4550-b694-da14e00cf6f3 | L3 agent   | cpn001 | nova              | :-)   | UP    | neutron-l3-agent |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      ```
      {/caption}
   
   1. Удалите роутер с агента, на котором он расположен, и добавьте его на агент, выбранный ранее для миграции.

      <err>

      Нагрузка на сервер, на котором размещен выбранный агент, возрастет. Убедитесь, что ресурсов сервера достаточно для размещения дополнительного роутера.

      </err>

      ```console
      # openstack network agent remove router <SRC_l3_ID> <ROUTER_ID> --l3
      # openstack network agent add router <DST_l3_ID> <ROUTER_ID> --l3
      ```

      Здесь:

      * `<SRC_l3_ID>` — идентификатор L3 агента, с которого выполняется миграция.
      * `<DST_l3_ID>` — идентификатор L3 агента, на который выполняется миграция.
      * `<ROUTER_ID>` — идентификатор роутера, который нужно перенести.

         {caption(Пример команд)[align=left;position=above]}
         ```console
         # openstack network agent remove router fbce1819-9e94-4550-b694-da14e00cf6f3 f0620d62-ab42-4ff7-bbec-5e5440446517 --l3
         # openstack network agent add router 7604e0c3-9ca9-484e-82a8-94930252f82e f0620d62-ab42-4ff7-bbec-5e5440446517 --l3
         ```
         {/caption}

   1. Проверьте, что роутер запустился на агенте после миграции:

      ```console
      # openstack network agent list --router <ROUTER_ID>
      ```

      Здесь `<ROUTER_ID>` — идентификатор роутера.

         {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
         ```console
         # openstack network  agent list --router f0620d62-ab42-4ff7-bbec-5e5440446517
         +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
         | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
         +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
         | 7604e0c3-9ca9-484e-82a8-94930252f82e | L3 agent   | cpn002 | nova              | :-)   | UP    | neutron-l3-agent |
         +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
         ```
         {/caption}

   1. Проверьте доступность роутера с помощью команды `ping`.

      <info>

      Примерное время задержки на миграцию роутера 10-15 секунд на не загруженной операционной системе.

      </info>
   1. Проверьте, что пространство имен (namespace) роутера есть на узле, на который он был перенесен:

      ```console
      # ip netns | grep <ROUTER_ID>
      ```

      Здесь `<ROUTER_ID>` — идентификатор роутера.

         {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
         ```console
         # ip netns | grep f0620d62-ab42-4ff7-bbec-5e5440446517
         snat-f0620d62-ab42-4ff7-bbec-5e5440446517 (id: 123)
         qrouter-f0620d62-ab42-4ff7-bbec-5e5440446517 (id: 122)
         ```
         {/caption}

1. Последовательно перезагрузите серверы, кроме гипервизоров с High-IOPS дисками (хосты из группы `vkcloud_scst_iscsi`), предварительно убедившись в запуске всех сервисов и отсутствии ошибок в работе {var(sys2)} после перезагрузки каждого сервера:

   <info>

   Перед перезагрузкой управляющего узла поменяйте политики `imagePullPolicy` у деплоймента `mcs-admin-ui-app` на `IfNotPresent`:

   ```console
   # kubectl -n mcs-front-vkcloud edit deploy mcs-admin-ui-app
   ...
   #imagePullPolicy: Always
   imagePullPolicy: IfNotPresent
   ...
   ```

   Это позволит автоматически перезапустить все поды кластера Kubernetes без дополнительных ручных операций.

   </info>

   1. Зайдите на обновленный сервер и перезагрузите его:

      ```console
      $ ssh <SERVER_NAME>
      $ sudo shutdown -r now
      ```

      Здесь `<SERVER_NAME>` — имя обновленного сервера из файла `inventory.yaml`, созданного на предыдущих шагах.
   
   1. Убедитесь, что операционная система загрузилась без ошибок:

      ```console
      $ systemctl status | head -n 5
      ● <Server_name>
          State: running
           Jobs: 0 queued
         Failed: 0 units
          Since: <date>; 16min ago
      $ systemctl list-units --failed
        UNIT LOAD ACTIVE SUB DESCRIPTION
      0 loaded units listed.
      $ uname -r
      6.1.52-1.el7.3.x86_64
      ```

      <warn>

      Перезагружайте следующий сервер через 15 минут после успешной перезагрузки предыдущего.

      </warn>
      
   1. После перезапуска всех управляющих узлов проверьте, что все поды в Kubernetes запущены:

      ```console
      # Kubernetes Master
      $ sudo kubectl get pods -A | grep -v -e Running -e Compl
      ```

<err>

После перезагрузки управляющего узла убедитесь, что кластер PostgreSQL успешно запущен.

Проверьте состояние кластера на одном из управляющих узлов:

```console
$ sudo bash
# ls /srv/stolon/
bin                      postgres-magnum-addons-f3  postgres-projectsservice-f3  postgres-syncservice-f3
postgres-billingcore-f3  postgres-magnum-rapid-f3   postgres-servicesmanager-f3  postgres-xaas-f3

//Выберите любой из представленных 

# ls /srv/stolon/postgres-magnum-addons-f3/bin/stolonctl
/srv/stolon/postgres-magnum-addons-f3/bin/stolonctl

# ls /etc/stolon/
billingcore-stolon-cluster    magnum-rapid-stolon-cluster     servicesmanager-stolon-cluster  xaas-stolon-cluster
magnum-addons-stolon-cluster  projectsservice-stolon-cluster  syncservice-stolon-cluster

//Найдите аналогичное по названию имя кластера и добавьте его в команду далее

# /srv/stolon/postgres-magnum-addons-f3/bin/stolonctl status --cluster-name magnum-addons-stolon-cluster --store-backend consul --store-endpoints http://127.0.0.1:8500
```

Если в выводе команды `HEALTHY` выводится состоянии `False`, выполните следующие команды на всех управляющих узлах:

```console
$ sudo systemctl start stolon-keeper-postgres-billingcore-* stolon-keeper-postgres-projectsservice-* stolon-keeper-postgres-xaas-* stolon-keeper-postgres-magnum-addons-* stolon-keeper-postgres-servicesmanager-* stolon-keeper-postgres-magnum-rapid-* stolon-keeper-postgres-syncservice-*
```

Через 5 минут кластеры PostgreSQL должны синхронизироваться, а зависимые от них поды запуститься без ошибок.

</err>