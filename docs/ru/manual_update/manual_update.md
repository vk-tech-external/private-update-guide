# {heading(Ручное обновление пакетов)[id=manual_update]}

<warn>

Выполните только при обновлении Private Cloud с версии 4.0. 

</warn>

<warn>

Обновление пакетов выполняется от имени пользователя root на каждом контроллере кластера.

</warn>


## {heading(openstackcli)[id=openstackcli]}

1. Убедитесь, что запущен Nexus c новой версией Private Cloud.
1. Удалите пакет на хосте:

    ```console
    # yum remove python3-openstackclient
    ```

1. Очистите кеш и обновите индексы:

    ```console
    # yum clean all; yum makecache
    ```

1. Установите пакет:

    ```console
    # yum install python3-openstackclient
    ```
    
    <info>

    Версия `python3-openstackclient` при этом не изменится. 

    </info>

## {heading(consul)[id=consul]}

1. Убедитесь, что запущен Nexus c новой версией Private Cloud.
1. Обновите локальный кеш метаданных подключенных репозиториев:

    ```console
    # yum makecache
    ```

1. Обновите пакет: 

    ```console
    # yum upgrade consul 
    ```

1. Перезапустите сервис: 

    ```console
    # systemctl restart consul
    ```

## {heading(exabpg)[id=exabpg]}

1. Убедитесь, что запущен Nexus c новой версией Private Cloud.
1. Обновите локальный кеш метаданных подключенных репозиториев:

    ```console
    # yum makecache 
    ```

1. Сохраните конфигурацию:

    ```console
    # cp /etc/exabgp/exabgp.conf /root
    ```

1. Удалите установленные версии:

    ```console
    # yum remove python3-exabgp exabgp 
    ```

1. Установите пакеты из репозитория `redos-iaas-prod-rpm-govcloud`:

    ```console
    # yum install python3-exabgp exabgp 
    ```

1. Восстановите конфигурационный файл:

    ```console
    # cp /root/exabgp.conf /etc/exabgp/
    ```

1. Запустите сервис:

    ```console
    # systemctl start exabgp 
    ```

## {heading(stolon и pgbouncer)[id=stolon_pgbouncer]}

1. Убедитесь, что запущен Nexus c новой версией Private Cloud.
1. Обновите локальный кеш метаданных подключенных репозиториев:

    ```console
    # yum makecache
    ```

1. Установите и обновите пакеты:

    ```console
    # yum install stolon; yum upgrade pgbouncer
    ```

1. В каждом каталоге в директории `/srv/stolon/postgres` выполните следующие действия:

    * Перейдите в каталог `bin`.
    * Удалите файлы: 

        ```console
        # rm stolonctl stolon-keeper stolon-proxy stolon-sentinel
        ```

    * Выполните команду:
    
        ```console
        # for i in stolonctl stolon-keeper stolon-proxy stolon-sentinel; do ln -s /usr/bin/${i} ./${i}; done
        ```

1. Перезапустите сервисы в каждом каталоге:

    * `pgbouncer-<ИМЯ_КАТАЛОГА>.service`.
    * `postgres_exporter-<ИМЯ_КАТАЛОГА>.service`.
    * `stolon-keeper-<ИМЯ_КАТАЛОГА>.service`.
    * `stolon-sentinel-<ИМЯ_КАТАЛОГА>.service`.
    
    Здесь `<ИМЯ_КАТАЛОГА>` — имя каталога в директории `/srv/stolon`. Пример: `postgres-magnum-rapid-f1`.

    Выполните команду:

    ```console
    # sudo systemctl restart <ИМЯ_СЕРВИСА>
    ```

    Здесь `<ИМЯ_СЕРВИСА>` — полное имя сервиса. Пример: `pgbouncer-postgres-magnum-rapid-f1.service`.

## {heading(proxysql)[id=proxysql]}

1. Убедитесь, что запущен Nexus c новой версией Private Cloud.
1. Обновите локальный кеш метаданных подключенных репозиториев:

    ```console
    # yum makecache
    ```

1. Сохраните конфигурацию:

    ```console
    # cp /etc/proxysql.cnf /root 
    ```

1. Установите пакет:

    ```console
    # yum install proxysql
    ```

1. Восстановите конфигурацию:

    ```console
    # cp /etc/proxysql.cnf.rpmsave /etc/proxysql.cnf
    ```

1. Перезапустите сервис:

    ```console
    # systemctl restart proxysql 
    ```