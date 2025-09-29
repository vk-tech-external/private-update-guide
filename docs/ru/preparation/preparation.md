# {heading(Подготовка)[id=preparation]}

Обновление {var(sys2)} запустит обновление Tarantool с версии 2.10 на версию из дистрибутива `tarantool-enterprise-3`. Возможны задержки в работе Портала самообслуживания и IAM на момент обновления.

{var(sys1)} будет недоступна во время выполнения плейбука `breeze-deploy.yml` и восстановится после успешной отработки плейбуков `breeze-deploy.yml` и `dusk-deploy.yml`.

Среднее время задержки составит приблизительно 15-20 минут.

Рекомендуется проводить обновление в менеджере терминалов Tmux или Screen.

<!--- //todo На данный момент Максим Финоженок сказал оставить без пояснения как происходит запрет. Нужно уточнить -->

{note:err}

На время обновления запретите доступ пользователям к Порталу самообслуживания и API продукта.

{/note}

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

**При обновлении с версии 4.1.1:**

1. На управляющем узле выполните команды:

   {note:info}

   Список баз данных может отличаться в зависимости от используемых компонентов.

   {/note}

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

1. Проверьте, что резервные копии созданы:

   ```console
   $ sudo ls -la /srv/backup/*$(date '+%Y%m%d')*.tgz
   ```

   Ответ должен содержать список файлов резервных копий вида:

   `/srv/backup/<ИМЯ_БД>_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ИМЯ_БД>` — имя базы данных.
   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

**При обновлении с версии 4.2.0:**

1. На управляющем узле выполните команды:

   ```console
   $ cd /srv/backup/galera/scripts
   $ sudo bash ./backup_xtra.sh
   ```

1. Проверьте, что резервные копии созданы:

   ```console
   $ sudo ls -la /srv/backup/galera/*/*$(date '+%Y%m%d')*.tgz
   ```

   Ответ должен содержать список файлов резервных копий вида:

   `/srv/backup/galera/backup_<ИМЯ_БД>/xtrabackup_<ИМЯ_БД>_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ИМЯ_БД>` — имя базы данных.
   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Postgres)[id=backup_postgres]}

{note:warn}

В случае возникновения ошибки `Name or service not known` выполните команду для каждого SH-файла, указанного ниже, и повторите запуск:

```console
$ sudo bash
# sed -i 's/standby.postgresql-${DB_NAME}.service.compute/standby.postgresql-${DB_NAME\/\/_\/-}.query.dc1.compute/' /srv/backup/backup_pg_*
```

{/note}

**При обновлении с версии 4.1.1:**

1. На управляющем узле выполните команды:

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

1. Проверьте, что резервные копии созданы:

   ```console
   $ sudo ls -1t /srv/backup/*pg*$(date '+%Y%m%d')*.tgz | awk -F'_' '{db=$1"_"$2} !seen[db]++{print}'
   ```

   Ответ должен содержать список файлов резервных копий вида:

   `/srv/backup/<ИМЯ_БД>_pg_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ИМЯ_БД>` — имя базы данных.
   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

**При обновлении с версии 4.2.0:**

1. На управляющем узле выполните команды:

   ```console
   $ cd /srv/backup/postgres
   $ sudo bash ./backup_pg.sh
   ```

1. Проверьте, что резервные копии созданы:

   ```console
   $ sudo ls -la /srv/backup/postgres/*pg**$(date '+%Y%m%d')*.tgz
   ```

   Ответ должен содержать список файлов резервных копий вида:

   `/srv/backup/postgres/<ИМЯ_БД>_pg_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ИМЯ_БД>` — имя базы данных.
   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Tarantool)[id=backup_tarantool]}

На каждом управляющем узле:

1. Создайте резервные копии Tarantool и файлов конфигураций сервисов Dusk и Breeze:

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ sudo mkdir -p /srv/backup/tarantool/$(date '+%Y%m%d')/{tarantool,etc/breeze,etc/dusk,overlord} \
   && echo 'box.backup.start()' | sudo tarantoolctl enter breeze_01 \
   && echo 'box.backup.start()' | sudo tarantoolctl enter dusk_01 \
   && cp -r /var/lib/tarantool/snaps /var/lib/tarantool/xlogs /srv/backup/tarantool/$(date '+%Y%m%d')/tarantool/ \
   && cp -r /etc/breeze/* /srv/backup/tarantool/$(date '+%Y%m%d')/etc/breeze \
   && cp -r /etc/dusk/* /srv/backup/tarantool/$(date '+%Y%m%d')/etc/dusk \
   && cp -r /usr/local/etc/overlord/* /srv/backup/tarantool/$(date '+%Y%m%d')/overlord \
   && echo 'box.backup.stop()' | sudo tarantoolctl enter breeze_01 \
   && echo 'box.backup.stop()' | sudo tarantoolctl enter dusk_01
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $ sudo bash /usr/local/bin/tarantool_backup.sh
   ```
   {/caption}

1. Проверьте, что резервные копии созданы:

   ```console
   $ sudo ls -lR /srv/backup/tarantool/*
   ```
   
   Ответ должен содержать список файлов резервных копий Dusk и Breeze.

1. Заархивируйте резервные копии:

   ```console
   $ sudo cd /srv/backup/tarantool/ \
   && sudo tar -czvf /srv/backup/tarantool/tarantool_$(date '+%Y%m%d').tar.gz /srv/backup/tarantool/ \
   && sudo rm -rf /srv/backup/tarantool/$(date '+%Y%m%d')
   ```

1. Проверьте, что резервные копии заархивированы:

   ```console
   $ sudo ll /srv/backup/tarantool/tarantool_$(date '+%Y%m%d')*.gz
   ```

   Ответ должен содержать список файлов резервных копий вида:

   `/srv/backup/tarantool/tarantool_<ДАТА>.tar.gz`.

   Здесь:

   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Мониторинг)[id=backup_monitoring]}

#### {heading(Zabbix)[id=backup_zabbix]}

{note:info}

Время создания и размер резервной копии зависят от объема базы данных.

{/note}

**При обновлении с версии 4.1.1:**

1. На узле мониторинга запустите скрипт:

   ```console
   $ sudo bash /srv/backup/backup_xtra_zabbix.sh
   ```

1. Проверьте, что резервная копия создана:

   ```console
   $ sudo ls -1t /srv/backup/ZABBIX*$(date '+%Y%m%d')*.tgz
   ```

   Ответ должен содержать файл резервной копии вида:

   `/srv/backup/zabbix_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

**При обновлении с версии 4.2.0:**

1. На узле мониторинга запустите скрипт:

   ```console
   $ cd /srv/backup/galera/scripts
   $ sudo bash ./backup_xtra.sh
   ```

1. Проверьте, что резервная копия создана:

   ```console
   $ sudo ls -1t /srv/backup/galera/backup_zabbix/*ZABBIX*$(date '+%Y%m%d')*.tgz
   ```

   Ответ должен содержать файл резервной копии вида:

   `/srv/backup/galera/backup_zabbix/xtrabackup_ZABBIX_db_bcp_<ДАТА>_<ВРЕМЯ>.tgz`.

   Здесь:

   * `<ДАТА>` — дата создания резервной копии.
   * `<ВРЕМЯ>` — время создания резервной копии.

#### {heading(OpenSearch)[id=backup_opensearch]}

   
1. Создайте на узле мониторинга каталог для резервной копии:

   ```console
   $ sudo mkdir -p /srv/backup/opensearch/$(date '+%Y%m%d')
   ```
   
1. Создайте резервную копию:

   {note:info}

   Время создания и размер резервной копии зависят от объема данных БД.

   {/note}

   {note:info}

   Чтобы простой сервиса OpenSearch был минимальным, используйте многострочную команду создания резервной копии.

   {/note}

   ```console
   $ sudo docker stop opensearch opensearch_dashboards \
   && sudo cp -pr /var/lib/docker/volumes/opensearch-data1 /srv/backup/opensearch/$(date '+%Y%m%d')/ \
   && sudo cp /etc/opensearch/opensearch-dashboards.yml /srv/backup/opensearch/$(date '+%Y%m%d')/ \
   && sudo docker start opensearch opensearch_dashboards
   ```
   
1. Заархивируйте резервную копию:

   ```console
   $ sudo tar -czvf /srv/backup/opensearch/opensearch-$(date +%Y%m%d-%H%M).tar.gz /srv/backup/opensearch/$(date '+%Y%m%d')/
   $ sudo rm -rf /srv/backup/opensearch/$(date '+%Y%m%d')
   ```

1. Проверьте, что резервная копия создана:

   ```console
   $ sudo ls -lR /srv/backup/opensearch/*
   ```

   Ответ должен содержать файл резервной копии вида:

   `/srv/backup/opensearch/opensearch-<ДАТА>.tar.gz`.

   Здесь `<ДАТА>` — дата создания резервной копии.

### {heading(etcd)[id=backup_etcd]}

На управляющем узле создайте директорию для резервных копий:

```console
$ sudo mkdir -p /srv/backup/etcd/
```

#### {heading(Kubernetes)[id=backup_kubernetes]}

На управляющем узле создайте резервную копию:

```console
$ sudo etcdctl --endpoints=https://127.0.0.1:2379 \
          --cacert=/etc/etcd/ca.crt\
          --cert=/etc/kubernetes/pki/kube-etcd.crt \
          --key=/etc/kubernetes/pki/kube-etcd.key \
          snapshot save /srv/backup/etcd/k8s-$(date +%Y%m%d-%H%M).db
```

Чтобы проверить, что резервная копия создана, выполните команду:

   ```console
   $ sudo ls -lR /srv/backup/etcd/k8s*
   ```

Ответ должен содержать файл резервной копии вида `k8s-<ДАТА>-<ВРЕМЯ>.db`.

Здесь:

* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

#### {heading(IAM)[id=backup_iam]}

На управляющем узле создайте резервную копию:

```console
$ sudo etcdctl --endpoints=127.0.0.1:22379 snapshot save /srv/backup/etcd/iam-$(date +%Y%m%d-%H%M).db
```

Чтобы проверить, что резервная копия создана, выполните команду:

   ```console
   $ sudo ls -lR /srv/backup/etcd/iam*
   ```

Ответ должен содержать файл резервной копии вида `iam-<ДАТА>-<ВРЕМЯ>.db`.

Здесь:

* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

#### {heading(Scrooge)[id=backup_scrooge]}

На управляющем узле создайте резервную копию:

```console
$ sudo etcdctl --endpoints=127.0.0.1:24379 snapshot save /srv/backup/etcd/scrooge-$(date +%Y%m%d-%H%M).db
```

Чтобы проверить, что резервная копия создана, выполните команду:

   ```console
   $ sudo ls -lR /srv/backup/etcd/scrooge*
   ```

Ответ должен содержать файл резервной копии вида `scrooge-<ДАТА>-<ВРЕМЯ>.db`.

Здесь:

* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

### {heading(Apache ZooKeeper)[id=backup_apache_zookeeper]}

Для резервного копирования сохраните `/var/lib/zookeeper` на всех управляющих узлах любым удобным способом.

{caption(Пример команды)[align=left;position=above]}
```console
$ sudo tar -czvf /srv/backup/zookeeper-$(date +%Y%m%d-%H%M).tar.gz /var/lib/zookeeper
```
{/caption}

Чтобы проверить, что резервная копия сохранена, выполните команду:

   ```console
   $ sudo ls -lR /srv/backup/zookeeper*
   ```

Ответ должен содержать файл резервной копии вида `zookeeper-<ДАТА>-<ВРЕМЯ>.db`.

Здесь:

* `<ДАТА>` — дата создания резервной копии.
* `<ВРЕМЯ>` — время создания резервной копии.

## {heading(Восстановление)[id=recovery]}

### {heading(MySQL/Galera)[id=recovery_mysql_galera]}

{note:warn}

В примере ниже приведено описание восстановления базы сервиса Octavia. Восстановление БД других сервисов проводится аналогичным образом.

{/note}

1. Остановите сервис базы данных на всех управляющих узлах:

   ```console
   $ sudo systemctl stop mariadb-octavia
   ```
   
1. Удалите все предыдущие данные на всех управляющих узлах:

   ```console
   $ sudo rm -rf /srv/mysql/octavia/data/*
   ```
   
1. Зайдите по SSH на первый управляющий узел и распакуйте архив с резервной копией:

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ cd /srv/backup/
   $ tar xzvf OCTAVIA_db_bcp_20240624_1743.tgz
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $ cd /srv/backup/galera/backup_octavia
   $ tar xzvf xtrabackup_OCTAVIA_db_bcp_20240624_1743.tgz -C /
   ```
   {/caption}

1. Выведите содержимое файла `xtrabackup_galera_info`:

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ cat /srv/backup/extrabackup_octavia/xtrabackup_galera_info
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $  cat /srv/backup/galera/backup_octavia/temp_xtrabackup_octavia/xtrabackup_galera_info 
   ```
   {/caption}

1. В выводе получите строку вида `<UUID>:<SEQNO>` с двумя значениями, разделенными двоеточием.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # cat xtrabackup_galera_info
   4f095201-2ce3-11ef-82f6-cfa78bf73a14:52797
   ```
   {/caption}

1. Создайте файл `grastate.dat` в папке с извлеченной резервной копией следующего содержания:

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

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ sudo mariabackup --defaults-file=/etc/octavia.cnf --copy-back \
     --target-dir=/srv/backup/extrabackup_octavia
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $ sudo mariabackup --defaults-file=/etc/octavia.cnf --copy-back \
     --target-dir=/srv/backup/galera/backup_octavia/temp_xtrabackup_octavia
   ```
   {/caption}

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

### {heading(Postgres)[id=recovery_postgres]}

{note:info}

Ниже приведен пример восстановления БД `magnum_addons`.

{/note}

1. Распакуйте архив резервной копии.

   {caption(Пример команды при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   # cd /srv/backup/
   # tar xzvf magnum_addons_pg_20240626_1608.tgz
   ```
   {/caption}

   {caption(Пример команды при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   # cd /srv/backup/postgres/
   # tar xzvf magnum_addons_pg_20240626_1608.tgz
   ```
   {/caption}

1. Посмотрите содержимое файла `/srv/backup/backup_pg_magnum_addons.sh`:

   {caption(Команда при обновлении с версии 4.1.1)[align=left;position=above]}
   ```console
   $ cat /srv/backup/backup_pg_magnum_addons.sh
   ```
   {/caption}

   {caption(Команда при обновлении с версии 4.2.0)[align=left;position=above]}
   ```console
   $ cat /srv/backup/postgres/backup_pg_magnum_addons.sh 
   ```
   {/caption}

   {caption(Пример файла)[align=left;position=above]}
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

{note:warn}

На разных управляющих узлах выполняются команды для разных узлов сервисов Dusk и Breeze. На первом управляющем узле выполняются команды для `dusk_01` и `breeze_01`, на втором — `dusk_02` и `breeze_02`, на третьем — `dusk_03` и `breeze_03`.

{/note}

1. Проверьте наличие резервной копии:

   ```console
   $ sudo ls -lah /srv/backup/tarantool/
   ```

1. На первом управляющем узле распакуйте архив резервной копии:

   ```console
   $ sudo tar -xzvf /srv/backup/tarantool/tarantool_<ДАТА>.tar.gz -C /
   ```

1. Проверьте, на каком из узлов расположены master-узлы сервисов Dusk и Breeze:

   ```console
   # export ETCDCTL_API=2 
   etcdctl --endpoints=http://127.0.0.1:22379 get /mcs/tarantool/dusk/clusters/dusk/master
   etcdctl --endpoints=http://127.0.0.1:22379 get /mcs/tarantool/breeze/clusters/breeze/master
   ```

   {caption(Пример ожидаемого результата)[align=left;position=above]}
   ```console
   dusk_01
   breeze_01
   ```
   {/caption}

1. На деплой-ноде убедитесь, что значения master-узлов сервисов Dusk и Breeze совпадает со значениями переменных в Inventory:

   ```console
   $ cd inventory/vkcloud
   $  grep -ri breeze_master
   group_vars/vkcloud_mcs_breeze/vars.yml:breeze_clusters_breeze_master: breeze_01
   $  grep -ri dusk_master
   group_vars/vkcloud_mcs_dusk/vars.yml:dusk_clusters_dusk_master: dusk_01
   ```
   
1. При обновлении с версии 4.1.1 на деплой-ноде восстановите значения версий Tarantool, Dusk, Breeze, а также имя пакета для Tarantool.

   1. Проверьте версии Tarantool, Dusk, Breeze:
   
      ```console
      $ grep -E 'tarantool|breeze|dusk' ./group_vars/vkcloud/versions.yml
      ```
      
      Для работы Tarantool 2.10 должны быть следующие версии:
   
      ```console
      breeze: 4.0.0.rc.20230426-202405270931.gitbb89a610
      dusk: 4.1.1-1
      tarantool: 2.10.3-1
      ```

   1. Проверьте имя пакета Tarantool:

      ```console
      $ grep -E 'tarantool' ./group_vars/vkcloud/packages.yml
      ```

      Имя пакета Tarantool 2.10 должно быть следующим, без слова `enterprise` или `.el7`:

      ```console
      tarantool: tarantool-{{ pkg_version.tarantool }}.x86_64
      ```

1. Поочередно подключитесь по SSH к каждому управляющему узлу, остановите сервисы БД и Overlord для сервисов:

   ```console
   $ ssh <УЗЕЛ>
   $ sudo systemctl stop tarantool@<УЗЕЛ_BREEZE>.service tarantool@<УЗЕЛ_DUSK>.service overlord@<УЗЕЛ_BREEZE>.service overlord@<УЗЕЛ_DUSK>.service
   $ exit
   ```
   
   Здесь:

   - `<УЗЕЛ>` — имя управляющего узла, например `cpn001`.
   - `<УЗЕЛ_BREEZE>` — имя узла Breeze, например `breeze_01`.
   - `<УЗЕЛ_DUSK>` — имя узла Dusk, например `dusk_01`.

1. При обновлении с версии 4.1.1 верните Tarantool 2.10:

   1. На каждом управляющем узле удалите Tarantool 3:

      1. При наличии файлов существующей БД, скопируйте их:

         ```console
         # mv /var/lib/tarantool/xlogs/<УЗЕЛ_BREEZE> /var/lib/tarantool/xlogs/<УЗЕЛ_BREEZE>_old
         # mv /var/lib/tarantool/snaps/<УЗЕЛ_BREEZE> /var/lib/tarantool/snaps/<УЗЕЛ_BREEZE>_old
         # mv /var/lib/tarantool/xlogs/<УЗЕЛ_DUSK> /var/lib/tarantool/xlogs/<УЗЕЛ_DUSK>_old
         # mv /var/lib/tarantool/snaps/<УЗЕЛ_DUSK> /var/lib/tarantool/snaps/<УЗЕЛ_DUSK>_old
         ```

         Здесь:

         - `<УЗЕЛ_BREEZE>` — имя узла Breeze, например `breeze_01`.
         - `<УЗЕЛ_DUSK>` — имя узла Dusk, например `dusk_01`.
   
      1. Удалите Tarantool 3:

         ```console
         # dnf remove tarantool-enterprise
         ```

         {note:info}При удалении Tarantool будут удалены `mcs_breeze` и `mcs_dusk`.{/note}

   1. Установите Tarantool 2.10. Для этого на деплой-ноде запустите плейбуки:

      ```console
      $ cd ~/inventory/vkcloud
      $ ../ansible-openstack/tools/box.sh   deploy   -b ../ansible-openstack   -i vkcloud.yml   --playbook breeze-deploy.yml   -s iam   -e @/home/centos/corpcloud_vars.yml -e dev_mfapanel=true   --disks-autoconfigure -e bootstrap=true
      $ ../ansible-openstack/tools/box.sh   deploy   -b ../ansible-openstack   -i vkcloud.yml   --playbook dusk-deploy.yml   -s iam   -e @/home/centos/corpcloud_vars.yml -e dev_mfapanel=true   --disks-autoconfigure -e bootstrap=true
      ```

1. На каждом управляющем узле остановите сервисы БД и Overlord:

   ```console
   $ sudo systemctl stop tarantool@<УЗЕЛ_BREEZE> tarantool@<УЗЕЛ_DUSK> overlord@<УЗЕЛ_BREEZE> overlord@<УЗЕЛ_DUSK>
   ```

   Здесь:

   - `<УЗЕЛ_BREEZE>` — имя узла Breeze, например `breeze_01`.
   - `<УЗЕЛ_DUSK>` — имя узла Dusk, например `dusk_01`.

1. Очистите хранилище Tarantool:

   ```console
   $ rm -rf /var/lib/tarantool/snaps/*/* /var/lib/tarantool/xlogs/*/*
   ```
   
1. На первом управляющем узле восстановите резервную копию:

   ```console
   $ sudo cp -r /srv/backup/tarantool/tarantool/<ДАТА>/tarantool/snaps/breeze_01 /var/lib/tarantool/snaps/
   $ sudo cp -r /srv/backup/tarantool/tarantool/<ДАТА>/tarantool/xlogs/breeze_01 /var/lib/tarantool/xlogs/
   $ sudo cp -r /srv/backup/tarantool/tarantool/<ДАТА>/tarantool/snaps/dusk_01 /var/lib/tarantool/snaps/
   $ sudo cp -r /srv/backup/tarantool/tarantool/<ДАТА>/tarantool/xlogs/dusk_01 /var/lib/tarantool/xlogs/
   $ sudo chown -R tarantool:tarantool /var/lib/tarantool
   ```
   
1. На остальных управляющих узлах создайте пустые директории для сервисов:

   ```console
   $ sudo mkdir /var/lib/tarantool/snaps/<УЗЕЛ_BREEZE> /var/lib/tarantool/xlogs/<УЗЕЛ_BREEZE>
   $ sudo chown tarantool:tarantool /var/lib/tarantool/snaps/<УЗЕЛ_BREEZE>
   $ sudo chown tarantool:tarantool /var/lib/tarantool/xlogs/<УЗЕЛ_BREEZE>
   $ sudo mkdir /var/lib/tarantool/snaps/<УЗЕЛ_DUSK> /var/lib/tarantool/xlogs/<УЗЕЛ_DUSK>
   $ sudo chown tarantool:tarantool /var/lib/tarantool/snaps/<УЗЕЛ_DUSK>
   $ sudo chown tarantool:tarantool /var/lib/tarantool/xlogs/<УЗЕЛ_DUSK>
   ```

   Здесь:

   - `<УЗЕЛ_BREEZE>` — имя узла Breeze, например `breeze_02`.
   - `<УЗЕЛ_DUSK>` — имя узла Dusk, например `dusk_02`.
   
1. На каждом управляющем узле, начиная с первого, запустите и проверьте сервисы:

   ```console
   $ sudo systemctl start tarantool@<УЗЕЛ_BREEZE>.service
   $ sudo systemctl status tarantool@<УЗЕЛ_BREEZE>.service
   $ sudo systemctl start overlord@<УЗЕЛ_BREEZE>.service
   $ sudo systemctl status overlord@<УЗЕЛ_BREEZE>.service
   $ sudo systemctl start tarantool@<УЗЕЛ_DUSK>.service
   $ sudo systemctl status tarantool@<УЗЕЛ_DUSK>.service
   $ sudo systemctl start overlord@<УЗЕЛ_DUSK>.service
   $ sudo systemctl status overlord@<УЗЕЛ_DUSK>.service
   ```

   Здесь:

   - `<УЗЕЛ_BREEZE>` — имя узла Breeze, например `breeze_01`.
   - `<УЗЕЛ_DUSK>` — имя узла Dusk, например `dusk_01`.

1. Проверьте корректность восстановления: авторизуйтесь в Портале самообслуживания. Если авторизация прошла успешно, БД восстановлены корректно.

### {heading(Мониторинг)[id=recovery_monitoring]}

#### {heading(Zabbix)[id=recovery_zabbix]}

Восстановление БД `mariadb-zabbix` на сервере мониторинга проведите аналогично процедуре восстановления БД MySQL/Galera на управляющих узлах, приведенной в разделе {linkto(#recovery_mysql_galera)[text=%text]}.

{note:warn}

БД мониторинга работает в standalone-режиме. Поэтому при прохождении процедуры восстановления БД пропустите шаги редактирования файла `/etc/octavia.cnf` и создания файла `/srv/backup/extrabackup_octavia/grastate.dat`.

{/note}

#### {heading(OpenSearch)[id=recovery_opensearch]}

1. Распакуйте резервную копию в `/var/lib/backups/opensearch`:

   ```console
   $ tar -xzvf ls /srv/backup/opensearch/opensearch-<ДАТА>.tar.gz -C /
   ```
   
1. Остановите OpenSearch, восстановите резервную копию и запустите OpenSearch:

   {note:info}

   Чтобы простой сервиса был минимальным, используйте многострочную команду.

   {/note}

   ```console
   $ sudo docker stop opensearch opensearch_dashboards \
   && sudo mv /srv/backup/opensearch/<ДАТА>/opensearch-data1  /var/lib/docker/volumes/ \
   && sudo cp /srv/backup/opensearch/<ДАТА>/opensearch-dashboards.yml /etc/opensearch/opensearch-dashboards.yml \
   && sudo chown -R redos:redos /var/lib/docker/volumes/opensearch-data1/_data \
   && sudo chown opensearch:opensearch /etc/opensearch/opensearch-dashboards.yml \
   && sudo docker start opensearch opensearch_dashboards
   ```

### {heading(etcd)[id=recovery_etcd]}

#### {heading(Kubernetes)[id=recovery_kubernetes]}

{note:info}Каждый из шагов выполните на всех управляющих узлах.{/note}

1. Остановите сервис:

   ```console
   $ sudo systemctl stop etcd
   ```

1. При наличии файлов существующей БД, скопируйте их:

   ```console
   $ sudo mv /var/lib/etcd/ /var/lib/etcd-old
   ```

1. Восстановите БД из резервной копии:

   ```console
   $ sudo etcdctl --cacert=/etc/etcd/ca.crt --cert=/etc/kubernetes/pki/kube-etcd.crt --key=/etc/kubernetes/pki/kube-etcd.key snapshot restore \
   --name cpn001 \
   --initial-cluster cpn001=https://10.133.90.15:2380,cpn002=https://10.133.90.16:2380,cpn003=https://10.133.90.17:2380 \
   --initial-cluster-token etcd-cluster-0 \
   --initial-advertise-peer-urls https://10.133.90.15:2380 \
   --data-dir /var/lib/etcd /srv/backup/etcd/k8s-20250402-1228.db
   ```

1. Установите права на восстановленную БД:

   ```console
   $ chown -R etcd:etcd /var/lib/etcd
   ```

1. Запустите etcd:

   ```console
   $ sudo systemctl start etcd
   ```

#### {heading(IAM)[id=recovery_iam]}

{note:info}Каждый из шагов выполните на всех управляющих узлах.{/note}

1. Остановите etcd:

   ```console
   $ sudo systemctl stop etcd-iam-node<НОМЕР>
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. При наличии файлов существующей БД, скопируйте их:

   ```console
   $ sudo mv /srv/etcd/etcd-iam-node<НОМЕР> /srv/etcd/etcd-iam-node<НОМЕР>-old
   ```
   
   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.
   
1. Восстановите БД из резервной копии на всех управляющих узлах:

   ```console
   $ node=node<НОМЕР>
   $ rm -rf /srv/etcd/etcd-iam-$node/default.etcd/

   ETCDCTL_API=3 etcdctl snapshot restore /srv/backup/etcd/iam-<ДАТА>-<ВРЕМЯ>.db \
   --name etcd-iam-$node \
   --initial-cluster etcd-iam-node1=http://10.133.90.15:22380,etcd-iam-node2=http://10.133.90.16:22380,etcd-iam-node3=http://10.133.90.17:22380 \
   --initial-cluster-token vkcloud_iam_etcd_cluster \
   --initial-advertise-peer-urls http://10.133.90.15:22380 \
   --data-dir /srv/etcd/etcd-iam-$node/default.etcd

   chmod 0700 /srv/etcd/etcd-iam-$node/default.etcd
   chown -R etcd:etcd /srv/etcd/etcd-iam-$node/
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. Установите права на восстановленную БД:

   ```console
   $ chown -R etcd:etcd /srv/etcd/etcd-iam-node<НОМЕР>/
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.
   
1. Запустите etcd:

   ```console
   $ sudo systemctl start etcd-iam-node<НОМЕР>
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

#### {heading(Scrooge)[id=recovery_scrooge]}

{note:info}Каждый из шагов выполните на всех управляющих узлах.{/note}

1. Остановите etcd:

   ```console
   $ sudo systemctl stop etcd-scrooge-node<НОМЕР>
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. При наличии файлов существующей БД, скопируйте их:

   ```console
   $ sudo mv /srv/etcd/etcd-scrooge-node<НОМЕР> /srv/etcd/etcd-scrooge-node<НОМЕР>-old
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. Восстановите БД из резервной копии на всех управляющих узлах:

   ```console
   $ node=node<НОМЕР>
   $ rm -rf /srv/etcd/etcd-iam-$node/default.etcd/

   ETCDCTL_API=3 etcdctl snapshot restore /srv/backup/etcd/iam-<ДАТА>-<ВРЕМЯ>.db \
   --name etcd-iam-$node \
   --initial-cluster etcd-scrooge-node1=http://10.133.90.15:22380,etcd-scrooge-node2=http://10.133.90.16:22380,etcd-scrooge-node3=http://10.133.90.17:22380 \
   --initial-cluster-token vkcloud_iam_etcd_cluster \
   --initial-advertise-peer-urls http://10.133.90.15:22380 \
   --data-dir /srv/etcd/etcd-iam-$node/default.etcd

   chmod 0700 /srv/etcd/etcd-iam-$node/default.etcd
   chown -R etcd:etcd /srv/etcd/etcd-iam-$node/
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. Установите права на восстановленную БД:

   ```console
   $ chown -R etcd:etcd /srv/etcd/etcd-scrooge-node<НОМЕР>/
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

1. Запустите etcd:

   ```console
   $ sudo systemctl start etcd-scrooge-node<НОМЕР>
   ```

   Здесь `<НОМЕР>` — номер управляющего узла, например `1`.

### {heading(Apache Zookeeper)[id=recovery_apache_zookeeper]}

Чтобы восстановить Apache Zookeeper, выполните следующие операции на всех управляющих узлах:

1. При наличии файлов существующей БД, скопируйте их:

   ```console
   $ sudo mv /var/lib/zookeeper /var/lib/zookeeper-old
   ```
   
1. Разархивируйте архив резервной копии:

   ```console
   $ sudo tar -xvf /srv/backup/zookeeper-<ДАТА>.tar.gz -C /
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

{note:warn}

Заданные ниже переменные будут использоваться на протяжении всего обновления {var(sys2)}.

{/note}

Задайте переменные оболочки для работы с обновлением:

{caption(Пример значений переменных при обновлении с версии 4.1.1)[align=left;position=above]}
```console
export NEW_RELEASE_NAME="4.2.2"
export PREV_RELEASE_NAME="4.1.1"
export NEW_DISTRIB_DIR="$HOME/box-4.2.2"
export PREV_DISTRIB_DIR="$HOME/box-4.1.1"
export PREV_INVENTORY_DIR="$HOME/inventory"
export INVGEN_ARCH="linux-amd64"
```
{/caption}

{caption(Пример значений переменных при обновлении с версии 4.2.0)[align=left;position=above]}
```console
export NEW_RELEASE_NAME="4.2.2"
export PREV_RELEASE_NAME="4.2.0"
export NEW_DISTRIB_DIR="$HOME/box-4.2.2"
export PREV_DISTRIB_DIR="$HOME/box-4.2.0"
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

{note:err}

Если сеанс оболочки завершился, заново задайте переменные.

{/note}

## {heading(Резервная копия Inventory)[id=inventory_backup]}

Создайте резервную копию Inventory предыдущего релиза:

```console
$ cp -r $PREV_INVENTORY_DIR $PREV_INVENTORY_DIR-${PREV_RELEASE_NAME}.bck
```
