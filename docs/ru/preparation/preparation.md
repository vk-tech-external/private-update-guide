# {heading(Подготовка)[id=preparation]}

Обновление {var(sys2)} запустит обновление Tarantool с версии 2.10 на версию из дистрибутива `tarantool-enterprise-3`. Возможны задержки в работе Портала самообслуживания и IAM на момент обновления.

{var(sys1)} будет недоступна во время выполнения плейбука `breeze-deploy.yml` и восстановится после успешной отработки плейбуков `breeze-deploy.yml` и `dusk-deploy.yml`.

Среднее время задержки составит приблизительно 15-20 минут.

Рекомендуется проводить обновление в менеджере терминалов Tmux или Screen.

<!--- //todo На данный момент Максим Финоженок сказал оставить без пояснения как происходит запрет. Нужно уточнить -->

<err>

На время обновления запретите доступ пользователям к Порталу самообслуживания и API продукта.

</err>

## {heading(Создание резервной копии баз данных)[id=database_backup_create]}

Перед началом создания резервной копии оцените наличие свободного места на сервере, на котором производится резервное копирование, и следите за его количеством в процессе копирования.

Резервные копии создаются в директориях, в которых находятся запускаемые скрипты. После создания перенесите их на сервер или в отдельное хранилище.

### {heading(Список баз данных)[id=database_list]}

На {var(sys3)} используются следующие средства хранения служебных данных:

* MySQL/Galera.
* PostgreSQL.
* Tarantool (сервисы Dusk и Breeze).
* RabbitMQ.
* Apache ZooKeeper.
* etcd.
* OpenSearch.

### {heading(MySQL/Galera)[id=backup_galera_mysql]}

#### {heading(Управляющие узлы)[id=backup_control_nodes]}

Для создания резервных копий баз данных (БД) на управляющем узле выполните команды:

```console
$ sudo bash /srv/backup/backup_xtra_barbican.sh
$ sudo bash /srv/backup/backup_xtra_billingaccountservice.sh
$ sudo bash /srv/backup/backup_xtra_cinder.sh
$ sudo bash /srv/backup/backup_xtra_ghosts.sh
$ sudo bash /srv/backup/backup_xtra_glance.sh
$ sudo bash /srv/backup/backup_xtra_karboii.sh
$ sudo bash /srv/backup/backup_xtra_keycloak.sh
$ sudo bash /srv/backup/backup_xtra_keystone.sh
$ sudo bash /srv/backup/backup_xtra_maas.sh
$ sudo bash /srv/backup/backup_xtra_magnum.sh
$ sudo bash /srv/backup/backup_xtra_manila.sh
$ sudo bash /srv/backup/backup_xtra_neutron.sh
$ sudo bash /srv/backup/backup_xtra_nova.sh
$ sudo bash /srv/backup/backup_xtra_octavia.sh
$ sudo bash /srv/backup/backup_xtra_quotamanager.sh
$ sudo bash /srv/backup/backup_xtra_scroogearchive.sh
$ sudo bash /srv/backup/backup_xtra_scrooge.sh
$ sudo bash /srv/backup/backup_xtra_sdnbilling.sh
$ sudo bash /srv/backup/backup_xtra_sdnprojectsapi.sh
$ sudo bash /srv/backup/backup_xtra_sprut.sh
$ sudo bash /srv/backup/backup_xtra_trove.sh
```

В результате будут созданы архивы с резервными копиями вида:

`/srv/backup/<ИМЯ_БД>_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

Здесь:

* `<ИМЯ_БД>` — имя базы данных.
* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

#### {heading(Мониторинг)[id=backup_monitoring]}

Чтобы создать резервную копию БД мониторинга, запустите скрипт на сервере мониторинга:

```console
$ sudo bash /srv/backup/backup_xtra_zabbix.sh
```

<info>

Время создания и размер резервной копии зависят от объема данных БД.

</info>

В результате появится файл с резервной копией вида:

`/srv/backup/zabbix_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

Здесь:

* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Postgres)[id=backup_postgres]}

<warn>

В случае возникновения ошибки `Name or service not known` выполните команду для каждого SH-файла, указанного ниже, и повторите запуск:

```console
$ sudo bash
# sed -i 's/standby.postgresql-${DB_NAME}.service.compute/standby.postgresql-${DB_NAME\/\/_\/-}.query.dc1.compute/' /srv/backup/backup_pg_*
```

</warn>

Чтобы создать резервные копии БД, выполните команды на одном управляющем узле:

```console
$ sudo bash /srv/backup/backup_pg_bank_integration.sh
$ sudo bash /srv/backup/backup_pg_billingcore.sh
$ sudo bash /srv/backup/backup_pg_catalog.sh
$ sudo bash /srv/backup/backup_pg_commander.sh
$ sudo bash /srv/backup/backup_pg_glomgold.sh
$ sudo bash /srv/backup/backup_pg_golden_broker.sh
$ sudo bash /srv/backup/backup_pg_grange.sh
$ sudo bash /srv/backup/backup_pg_hoe.sh
$ sudo bash /srv/backup/backup_pg_infra_api.sh
$ sudo bash /srv/backup/backup_pg_magnum_addons.sh
$ sudo bash /srv/backup/backup_pg_magnumrapid.sh
$ sudo bash /srv/backup/backup_pg_saas_demo_broker.sh
$ sudo bash /srv/backup/backup_pg_scheduler.sh
$ sudo bash /srv/backup/backup_pg_services_manager.sh
$ sudo bash /srv/backup/backup_pg_store.sh
$ sudo bash /srv/backup/backup_pg_sync_service.sh
$ sudo bash /srv/backup/backup_pg_user_mngmnt.sh
```

В результате появятся файлы с резервными копиями вида:

`/srv/backup/<ИМЯ_БД>_pg_<ДАТА>_<ВРЕМЯ>.tgz`.

Здесь:

* `<ИМЯ_БД>` — имя базы данных.
* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Tarantool)[id=backup_tarantool]}

<warn>

В действиях, приведенных ниже, используются номерные экземпляры Tarantool первого управляющего узла: `breeze_01`, `dusk_01`.

</warn>

Чтобы создать резервные копии, выполните команды на первом управляющем узле:

1. Создайте каталоги для резервных копий:

   ```console
   $ sudo mkdir -p /var/lib/backups/tarantool
   ```
  
1. Создайте резервные копии:

   <info>

   Чтобы простой сервиса Tarantool был минимальным, используйте многострочную команду создания резервных копий.

   </info>

   ```console
   $ echo 'box.backup.start()' | sudo tarantoolctl enter breeze_01 \
   && echo 'box.backup.start()' | sudo tarantoolctl enter dusk_01 \
   && sudo cp -r /var/lib/tarantool/xlogs /var/lib/backups/tarantool/xlogs/ \
   && sudo cp -r /var/lib/tarantool/snaps /var/lib/backups/tarantool/snaps/ \
   && echo 'box.backup.stop()' | sudo tarantoolctl enter breeze_01 \
   && echo 'box.backup.stop()' | sudo tarantoolctl enter dusk_01
   ```
   
1. Заархивируйте резервные копии:

   ```console
   $ sudo tar -czvf /var/lib/backups/tarantool.tar.gz /var/lib/backups/tarantool
   ```

### {heading(OpenSearch)[id=backup_opensearch]}

1. Перед созданием резервной копии убедитесь, что каталога `/var/lib/backups/opensearch` нет на сервере мониторинга.
1. Остановите OpenSearch и выполните резервное копирование каталогов и файлов.

   <info>

   Время создания и размер резервной копии зависят от объема данных БД.

   </info>
   
1. Создайте на узле мониторинга каталог для резервной копии:

   ```console
   $ sudo mkdir -p /var/lib/backups/opensearch
   ```
   
1. Создайте резервную копию:

   <info>

   Чтобы простой сервиса OpenSearch был минимальным, используйте многострочную команду создания резервной копии.

   </info>

   ```console
   $ sudo docker stop opensearch opensearch_dashboards \
   && sudo cp -pr /var/lib/docker/volumes/opensearch-data1 /var/lib/backups/opensearch/ \
   && sudo cp /etc/opensearch/opensearch-dashboards.yml /var/lib/backups/opensearch/ \
   && sudo docker start opensearch opensearch_dashboards
   ```
   
1. Заархивируйте резервную копию:

   ```console
   $ sudo tar -czvf /var/lib/backups/opensearch-$(date +%Y%m%d-%H%M).tar.gz /var/lib/backups/opensearch
   $ sudo rm -rf /var/lib/backups/opensearch
   ```

В результате будет создан файл `/var/lib/backups/opensearch-<ДАТА>.tar.gz` с резервной копией базы OpenSearch. Здесь `<ДАТА>` — дата создания резервной копии.

### {heading(etcd)[id=backup_etcd]}

#### {heading(IAM)[id=backup_iam]}

На управляющем узле создайте резервную копию:

```console
$ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot save /srv/backup/iam-$(date +%Y%m%d-%H%M).db
```

В результате будет создан файл `iam-<ДАТА>.db`. Здесь `<ДАТА>` — дата создания резервной копии.

#### {heading(Magnum)[id=backup_magnum]}

Создайте резервную копию:

```console
$ sudo etcdctl --endpoints=127.0.0.1:23379 snapshot save /srv/backup/magnum-$(date +%Y%m%d-%H%M).db
```

В результате будет создан файл `magnum-<ДАТА>.db`. Здесь `<ДАТА>` — дата создания резервной копии.

#### {heading(Scrooge)[id=backup_scrooge]}

Создайте резервную копию:

```console
$ sudo etcdctl --endpoints=127.0.0.1:24379 snapshot save /srv/backup/scrooge-$(date +%Y%m%d-%H%M).db
```

В результате будет создан файл `scrooge-<ДАТА>.db`. Здесь `<ДАТА>` — дата создания резервной копии.

### {heading(Apache ZooKeeper)[id=backup_apache_zookeeper]}

Для резервного копирования сохраните `/var/lib/zookeeper` на всех управляющих узлах любым удобным способом.

{caption(Пример команды)[align=left;position=above]}
```console
$ sudo tar -czvf /srv/backup/zookeeper-$(date +%Y%m%d-%H%M).tar.gz /var/lib/zookeeper
```
{/caption}

## {heading(Восстановление)[id=recovery]}

### {heading(MySQL/Galera)[id=recovery_mysql_galera]}

#### {heading(Управляющие узлы)[id=recovery_control_nodes]}

<warn>

В примере ниже приведено описание восстановления базы сервиса Octavia. Восстановление БД других сервисов проводится аналогичным образом.

</warn>

1. Остановите сервис базы данных на всех управляющих узлах:

   ```console
   $ sudo systemctl stop mariadb-octavia
   ```
   
1. Удалите все предыдущие данные на всех управляющих узлах:

   ```console
   $ sudo rm -rf /srv/mysql/octavia/data/*
   ```
   
1. Зайдите по SSH на первый управляющий узел и распакуйте архив с резервной копией:

   ```console
   $ cd /srv/backup/
   $ tar xzvf OCTAVIA_db_bcp_20240624_1743.tgz
   ```
   
1. Выведите содержимое файла `~/xtrabackup_galera_info`:

   ```console
   $ cat /srv/backup/extrabackup_octavia/xtrabackup_galera_info
   ```
   
1. В выводе получите строку вида `<UUID>:<SEQNO>` с двумя значениями, разделенными двоеточием.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # cat extrabackup_octavia/xtrabackup_galera_info
   4f095201-2ce3-11ef-82f6-cfa78bf73a14:52797
   ```
   {/caption}

1. Создайте файл `/srv/backup/extrabackup_octavia/grastate.dat` следующего содержания:

   ```console
   version: 2.1
   uuid:    <UUID>
   seqno:   <SEQNO>
   safe_to_bootstrap: 1
   ```

   Здесь:

   * `<UUID>` — первое значение поля `uuid` из файла `~/xtrabackup_galera_info`.
   * `<SEQNO>` — первое значение поля `seqno` из файла `~/xtrabackup_galera_info`.

1. Восстановите резервную копию:

   ```console
   $ sudo mariabackup --defaults-file=/etc/octavia.cnf --copy-back \
     --target-dir=/srv/backup/extrabackup_octavia
   ```
   
1. Установите владельца каталога после восстановления:

   ```console
   $ sudo chown -R mysql:root /srv/mysql/octavia/data
   ```
   
1. Отредактируйте файл `/etc/octavia.cnf`:

   * Закомментируйте строку `wsrep_cluster_address` с адресами.
   * Добавьте строку `wsrep_cluster_address="gcomm://"`.

      {caption(Пример)[align=left;position=above]}
      ```console
      ...
      # wsrep_cluster_address="gcomm://10.33.3.11:13003,10.33.3.12:13003,10.33.3.13:13003"
      wsrep_cluster_address="gcomm://"

      ...
      ```
      {/caption}

1. На первом управляющем узле запустите сервис БД и проверьте, что он успешно запустился:

   ```console
   $ sudo systemctl start mariadb-octavia
   $ sudo systemctl status mariadb-octavia
   ```
   
1. Запустите сервис на остальных управляющих узлах и проверьте, что он успешно запустился:

   ```console
   $ sudo systemctl start mariadb-octavia
   $ sudo systemctl status mariadb-octavia
   ```
   
1. На первом управляющем узле отредактируйте файл `/etc/octavia.cnf`:

   * Удалите строку `wsrep_cluster_address="gcomm://"`, добавленную ранее.
   * Раскомментируйте строку `wsrep_cluster_address` с адресами, закомментированную ранее.

      {caption(Пример)[align=left;position=above]}
      ```console
      ...
      wsrep_cluster_address="gcomm://10.33.3.11:13003,10.33.3.12:13003,10.33.3.13:13003"

      ...
      ```
      {/caption}

1. На первом управляющем узле перезапустите сервис БД:

   ```console
   $ sudo systemctl restart mariadb-octavia
   ```

#### {heading(Мониторинг)[id=recovery_monitoring]}

Восстановление БД `mariadb-zabbix` на сервере мониторинга проведите аналогично процедуре на управляющих узлах, приведенной в разделе {linkto(#recovery_control_nodes)[text=%text]}.

<warn>

БД мониторинга работает в standalone-режиме. Поэтому при прохождении процедуры восстановления БД пропустите шаги редактирования файла `/etc/octavia.cnf` и создания файла `/srv/backup/extrabackup_octavia/grastate.dat`.

</warn>

### {heading(Postgres)[id=recovery_postgres]}

<info>

Ниже приведен пример восстановления БД `magnum_addons`.

</info>

1. Распакуйте архив резервной копии.

   {caption(Пример команды)[align=left;position=above]}
   ```console
   $ tar xzvf magnum_addons_pg_20240626_1608.tgz
   ```
   {/caption}

1. Посмотрите содержимое файла `/srv/backup/backup_pg_magnum_addons.sh`:

   ```console
   $ cat /srv/backup/backup_pg_magnum_addons.sh
   ```

   {caption(Пример содержимого файла)[align=left;position=above]}
   ```sh
   cd /srv/backup
   DATE=`date "+%Y%m%d_%H%M"`
   export DB_NAME=magnum_addons
   export PGPASSWORD="9h3n8R23HL0z283xBZ1j"
   pg_dump -h standby.postgresql-${DB_NAME}.service.compute \
     -U postgres -p 5445 -d ${DB_NAME} > ${DB_NAME}_pg_${DATE}.sql
   tar cvzf ${DB_NAME}_pg_${DATE}.tgz ${DB_NAME}_pg_${DATE}.sql
   rm -f ${DB_NAME}_pg_${DATE}.sql
   ```
   {/caption}

1. Запомните порт `5445`. Подставьте значение `${DB_NAME}` из этого файла в строку `standby.postgresql-${DB_NAME}.service.compute`, а также замените подстроку `standby` на `master`. Если в названии БД есть символы нижних подчеркиваний (`_`), замените их на дефисы (`-`).
1. Получите пароль для Postgres из vault-файла:

   ```console
   $ cd inventory/vkcloud/
   $ ansible -m debug -i vkcloud.yml -a "msg=\"\n\n{{ vault_postgresql_login_password }}\n\n\"" all[0] | sed 's/\\n/\n/g'
   ```
   
1. Войдите в консоль управления БД, подставив адрес и порт:

   ```console
   $ psql -h master.postgresql-magnum-addons.service.compute \
     -U postgres -p 5445 -d magnum_addons -c '\dt'
   ```
   
   Здесь:

   * `master.postgresql-magnum-addons.service.compute` — значение адреса.
   * `5445` — значение порта, полученное на шаге 2.

   {caption(Пример ожидаемого результата)[align=left;position=above]}
   ```console
   Password for user postgres:
   psql (12.12)
   Type "help" for help.

   magnum_addons=# \dt
                       List of relations
    Schema |          Name          | Type  |     Owner
   --------+------------------------+-------+---------------
    public | addon                  | table | magnum_addons
    public | cluster_addon          | table | magnum_addons
    public | cluster_template_addon | table | magnum_addons
    public | schema_migrations      | table | magnum_addons
    public | transition_log         | table | magnum_addons
   (5 rows)
   ```
   {/caption}

1. При наличии таблиц в БД, удалите их:

   ```console
   $ psql -h master.postgresql-magnum-addons.service.compute \
     -U postgres -p 5445 -d magnum_addons \
     -c 'drop table addon,cluster_addon,cluster_template_addon,schema_migrations,transition_log'
   ```
  
1. Восстановите базу из резервной копии:

   ```console
   $ psql -h master.postgresql-magnum-addons.service.compute \
    -U postgres -p 5445 \
    -d magnum_addons < magnum_addons_pg_20240626_1608.sql
   ```

Проверьте, что сервис, использующий БД, запущен и работает без ошибок. Пример: чтобы проверить работу БД `magnum_addons`, создайте кластер Kubernetes и добавьте ему любой аддон (подробнее — в документе **Руководство пользователя {var(system)}** в разделе **Контейнеры** → **Управление кластером** → **Управление аддонами**).

### {heading(Tarantool)[id=recovery_tarantool]}

<info>

В примере ниже приведено описание восстановления БД Tarantool на примере Breeze. Для Dusk действия будут аналогичны.

</info>

<warn>

Команды выполняются на разных управляющих узлах. Команды, включающие `Breeze_01`, выполняются на первом узле, `Breeze_02` — на втором, `Breeze_03` — на третьем.

</warn>

1. При наличии старой резервной копии, перенесите директорию резервных копий из Tarantool в `tarantool_old`, чтобы сохранить ее:

   ```console
   $ sudo mv /var/lib/backups/tarantool /var/lib/backups/tarantool_old
   ```
   
1. На первом управляющем узле распакуйте архив резервной копии:

   ```console
   $ sudo tar -xzvf /var/lib/backups/tarantool.tar.gz -C /
   ```
   
1. Поочередно зайдите по SSH на все управляющие узлы, остановите сервисы БД и Overlord для сервисов:

   ```console
   # Первый контроллер
   $ ssh <CPN001>
   $ sudo systemctl stop tarantool@breeze_01.service overlord@breeze_01.service
   $ exit
   
   # Второй контроллер
   $ ssh <CPN002>
   sudo systemctl stop tarantool@breeze_02.service overlord@breeze_02.service
   $ exit
   
   # Третий контроллер
   $ ssh <CPN003>
   sudo systemctl stop tarantool@breeze_03.service overlord@breeze_03.service
   $ exit
   ```
   
1. При наличии файлов существующей БД, скопируйте их:

   ```console
   # Первый контроллер
   $ sudo mv /var/lib/tarantool/xlogs/breeze_01 /var/lib/tarantool/xlogs/breeze_01_old
   $ sudo mv /var/lib/tarantool/snaps/breeze_01 /var/lib/tarantool/snaps/breeze_01_old
   
   # Второй контроллер
   $ sudo mv /var/lib/tarantool/xlogs/breeze_02 /var/lib/tarantool/xlogs/breeze_02_old
   $ sudo mv /var/lib/tarantool/snaps/breeze_02 /var/lib/tarantool/snaps/breeze_02_old
   
   # Третий контроллер
   $ sudo mv /var/lib/tarantool/xlogs/breeze_03 /var/lib/tarantool/xlogs/breeze_03_old
   $ sudo mv /var/lib/tarantool/snaps/breeze_03 /var/lib/tarantool/snaps/breeze_03_old
   ```
   
1. На первом управляющем узле восстановите резервную копию:

   ```console
   # Первый контроллер
   $ ssh <CPN001>
   $ sudo cp -r /var/lib/backups/tarantool/snaps/breeze_01 /var/lib/tarantool/snaps/
   $ sudo cp -r /var/lib/backups/tarantool/xlogs/breeze_01 /var/lib/tarantool/xlogs/
   $ sudo chown -R tarantool:tarantool /var/lib/tarantool
   $ exit
   ```
   
1. На остальных управляющих узлах создайте пустые директории для сервисов:

   ```console
   # Второй контроллер
   $ ssh <CPN002>
   $ sudo mkdir /var/lib/tarantool/snaps/breeze_02 /var/lib/tarantool/xlogs/breeze_02
   $ sudo chown tarantool:tarantool /var/lib/tarantool/snaps/breeze_02
   $ sudo chown tarantool:tarantool /var/lib/tarantool/xlogs/breeze_02
   $ exit
   
   # Третий контроллер
   $ ssh <CPN003>
   $ sudo mkdir /var/lib/tarantool/snaps/breeze_03 /var/lib/tarantool/xlogs/breeze_03
   $ sudo chown tarantool:tarantool /var/lib/tarantool/snaps/breeze_03
   $ sudo chown tarantool:tarantool /var/lib/tarantool/xlogs/breeze_03
   $ exit
   ```
   
1. Запустите сервисы по очереди начиная с первого управляющего узла:

   ```console
   # Запустить и проверить старт сервиса на первом контроллере
   $ ssh <CPN001>
   $ sudo systemctl start tarantool@breeze_01.service
   $ sudo systemctl status tarantool@breeze_01.service
   $ sudo systemctl start overlord@breeze_01.service
   $ sudo systemctl status overlord@breeze_01.service
   $ exit
   
   # Запустить и проверить старт сервиса на втором контроллере
   $ ssh <CPN002>
   $ sudo systemctl start tarantool@breeze_02.service
   $ sudo systemctl status tarantool@breeze_02.service
   $ sudo systemctl start overlord@breeze_02.service
   $ sudo systemctl status overlord@breeze_02.service
   $ exit
   
   # Запустить и проверить старт сервиса на третьем контроллере
   $ ssh <CPN003>
   $ sudo systemctl start tarantool@breeze_03.service
   $ sudo systemctl status tarantool@breeze_03.service
   $ sudo systemctl start overlord@breeze_03.service
   $ sudo systemctl status overlord@breeze_03.service
   $ exit
   ```
   
1. Проверьте корректность восстановления: авторизуйтесь в Портале самообслуживания. Если авторизация прошла успешно, БД восстановлены корректно.

### {heading(OpenSearch)[id=recovery_opensearch]}

1. Убедитесь, что каталог `/var/lib/backups/opensearch` отсутствует:

   ```console
   $ ls /var/lib/backups/opensearch
   ```
   
1. При наличии указанного каталога, переместите его:

   ```console
   $ sudo mv /var/lib/backups/opensearch /var/lib/backups/opensearch_old
   ```
   
1. Распакуйте резервную копию в `/var/lib/backups/opensearch`:

   ```console
   $ tar -xzvf /var/lib/backups/opensearch.tar.gz -C /
   ```
   
1. Остановите OpenSearch, восстановите резервную копию и запустите OpenSearch:

   <info>

   Чтобы простой сервиса был минимальным, используйте многострочную команду.

   </info>

   ```console
   $ sudo docker stop opensearch opensearch_dashboards \
   && sudo mv /var/lib/backups/opensearch/opensearch-data1  /var/lib/docker/volumes/ \
   && sudo cp /var/lib/backups/opensearch/opensearch-dashboards.yml /etc/opensearch/opensearch-dashboards.yml \
   && sudo chown -R centos:centos /var/lib/docker/volumes/opensearch-data1/_data \
   && sudo chown opensearch:opensearch /etc/opensearch/opensearch-dashboards.yml \
   && sudo docker start opensearch opensearch_dashboards
   ```

### {heading(etcd)[id=recovery_etcd]}

#### {heading(IAM)[id=recovery_iam]}

1. Остановите etcd на всех управляющих узлах:

   ```console
   # Остановить сервис на первом контроллере
   $ sudo systemctl stop etcd-iam-node1
   # Остановить сервис на втором контроллере
   $ sudo systemctl stop etcd-iam-node2
   # Остановить сервис на третьем контроллере
   $ sudo systemctl stop etcd-iam-node3
   ```
   
1. При наличии файлов существующей БД, скопируйте их:

   ```console
   # Создаем резервную копию на первом контроллере
   $ sudo mv /srv/etcd/etcd-iam-node1 /srv/etcd/etcd-iam-node1-old
   # Создаем резервную копию на втором контроллере
   $ sudo mv /srv/etcd/etcd-iam-node2 /srv/etcd/etcd-iam-node2-old
   # Создаем резервную копию на третьем контроллере
   $ sudo mv /srv/etcd/etcd-iam-node3 /srv/etcd/etcd-iam-node3-old
   ```
   
1. Восстановите БД из резервной копии на всех управляющих узлах:

   ```console
   # Восстанавливаем БД на первом контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-iam-node1/default.etcd/ iam.db
   # Восстанавливаем БД на втором контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-iam-node2/default.etcd/ iam.db
   # Восстанавливаем БД на третьем контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-iam-node3/default.etcd/ iam.db
   ```
   
1. Установите права на восстановленную БД:

   ```console
   # Устанавливаем права на первом контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-iam-node1/
   # Устанавливаем права на втором контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-iam-node2/
   # Устанавливаем права на третьем контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-iam-node3/
   ```
   
1. Запустите etcd:

   ```console
   # Запускаем на первом контроллере
   $ sudo systemctl start etcd-iam-node1
   # Запускаем на втором контроллере
   $ sudo systemctl start etcd-iam-node2
   # Запускаем на третьем контроллере
   $ sudo systemctl start etcd-iam-node3
   ```

#### {heading(Magnum)[id=recovery_magnum]}

1. Остановите сервис на всех управляющих узлах:

   ```console
   # Остановить сервис на первом контроллере
   $ sudo systemctl stop etcd-magnum-node1
   # Остановить сервис на втором контроллере
   $ sudo systemctl stop etcd-magnum-node2
   # Остановить сервис на третьем контроллере
   $ sudo systemctl stop etcd-magnum-node3
   ```
   
1. При наличии файлов существующей БД, скопируйте их:

   ```console
   # Создаем резервную копию на первом контроллере
   $ sudo mv /srv/etcd/etcd-magnum-node1 /srv/etcd/etcd-magnum-node1-old
   # Создаем резервную копию на втором контроллере
   $ sudo mv /srv/etcd/etcd-magnum-node2 /srv/etcd/etcd-magnum-node2-old
   # Создаем резервную копию на третьем контроллере
   $ sudo mv /srv/etcd/etcd-magnum-node3 /srv/etcd/etcd-magnum-node3-old
   ```
   
1. Восстановите БД из резервной копии на всех управляющих узлах:

   ```console
   # Восстанавливаем БД на первом контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-magnum-node1/default.etcd/ magnum.db
   # Восстанавливаем БД на втором контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-magnum-node2/default.etcd/ magnum.db
   # Восстанавливаем БД на третьем контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-magnum-node3/default.etcd/ magnum.db
   ```
   
1. Установите права на восстановленную БД:

   ```console
   # Устанавливаем права на первом контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-magnum-node1/
   # Устанавливаем права на втором контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-magnum-node2/
   # Устанавливаем права на третьем контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-magnum-node3/
   ```
   
1. Запустите etcd:

   ```console
   # Запускаем на первом контроллере
   $ sudo systemctl start etcd-magnum-node1
   # Запускаем на втором контроллере
   $ sudo systemctl start etcd-magnum-node2
   # Запускаем на третьем контроллере
   $ sudo systemctl start etcd-magnum-node3
   ```

#### {heading(Scrooge)[id=recovery_scrooge]}

1. Остановите etcd на всех управляющих узлах:

   ```console
   # Остановить сервис на первом контроллере
   $ sudo systemctl stop etcd-scrooge-node1
   # Остановить сервис на втором контроллере
   $ sudo systemctl stop etcd-scrooge-node2
   # Остановить сервис на третьем контроллере
   $ sudo systemctl stop etcd-scrooge-node3
   ```
   
1. При наличии файлов существующей БД, скопируйте их:

   ```console
   # Создаем резервную копию на первом контроллере
   $ sudo mv /srv/etcd/etcd-scrooge-node1 /srv/etcd/etcd-scrooge-node1-old
   # Создаем резервную копию на втором контроллере
   $ sudo mv /srv/etcd/etcd-scrooge-node2 /srv/etcd/etcd-scrooge-node2-old
   # Создаем резервную копию на третьем контроллере
   $ sudo mv /srv/etcd/etcd-scrooge-node3 /srv/etcd/etcd-scrooge-node3-old
   ```
   
1. Восстановите БД из резервной копии на всех управляющих узлах:

   ```console
   # Восстанавливаем БД на первом контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-scrooge-node1/default.etcd/ scrooge.db
   # Восстанавливаем БД на втором контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-scrooge-node2/default.etcd/ scrooge.db
   # Восстанавливаем БД на третьем контроллере
   $ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot restore --data-dir /srv/etcd/etcd-scrooge-node3/default.etcd/ scrooge.db
   ```
   
1. Установите права на восстановленную БД:

   ```console
   # Устанавливаем права на первом контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-scrooge-node1/
   # Устанавливаем права на втором контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-scrooge-node2/
   # Устанавливаем права на третьем контроллере
   $ chown -R etcd:etcd /srv/etcd/etcd-scrooge-node3/
   ```
   
1. Запустите etcd:

   ```console
   # Запускаем на первом контроллере
   $ sudo systemctl start etcd-scrooge-node1
   # Запускаем на втором контроллере
   $ sudo systemctl start etcd-scrooge-node2
   # Запускаем на третьем контроллере
   $ sudo systemctl start etcd-scrooge-node3
   ```

### {heading(Apache Zookeeper)[id=recovery_apache_zookeeper]}

Чтобы восстановить Apache Zookeeper, выполните следующие операции на всех управляющих узлах:

1. При наличии файлов существующей БД, скопируйте их:

   ```console
   $ sudo mv /var/lib/zookeeper /var/lib/zookeeper-old
   ```
   
1. Разархивируйте архив резервной копии:

   ```console
   $ sudo tar -xvf /tmp/zookeeper.tar.gz -C /
   ```
   
1. Перезапустите службу Apache Zookeeper:

   ```console
   $ sudo systemctl restart zookeeper
   ```
  
1. Проверьте состояние кластера:

   ```console
   $ echo ruok | nc localhost 2181
   $ echo stat | nc localhost 2181
   ```

## {heading(Переменные)[id=variables]}

<warn>

Заданные ниже переменные будут использоваться на протяжении всего обновления {var(sys2)}.

</warn>

Задайте переменные оболочки для работы с обновлением:

{caption(Пример значений переменных)[align=left;position=above]}
```console
export NEW_RELEASE_NAME="{var(version_new)}"
export PREV_RELEASE_NAME="{var(version_prev)}"
export NEW_DISTRIB_DIR="$HOME/box-{var(version_new)}"
export PREV_DISTRIB_DIR="$HOME/box-{var(version_prev)}"
export PREV_INVENTORY_DIR="$HOME/inventory"
export INVGEN_ARCH="linux-amd64"
```
{/caption}

Здесь:

* `NEW_RELEASE_NAME` — новая версия релиза {var(sys2)}.
* `PREV_RELEASE_NAME` — предыдущая версия релиза {var(sys2)}.
* `NEW_DISTRIB_DIR` — директория нового релиза.
* `PREV_DISTRIB_DIR` — директория предыдущего релиза.
* `PREV_INVENTORY_DIR` — директория предыдущего Inventory.
* `INVGEN_ARCH` — архитектура Inventory-генератора. Может быть одна из следующих:

   * `darwin-amd64`.
   * `darwin-arm64`.
   * `linux-amd64`.
   * `linux-arm64`.
   * `windows-amd64`.

<err>

Если сеанс оболочки завершился, заново задайте переменные.

</err>

## {heading(Резервная копия Inventory)[id=inventory_backup]}

Создайте резервную копию Inventory предыдущего релиза:

```console
$ cp -r $PREV_INVENTORY_DIR $PREV_INVENTORY_DIR-${PREV_RELEASE_NAME}.bck
```
