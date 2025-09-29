# {heading(Подготовка дистрибутива к обновлению)[id=preparing_distribution_updating]}

Дистрибутив распространяется по приватной ссылке или на физическом носителе и состоит из следующих частей:

* Архивы:

   * Архив файлов, необходимых для запуска изолированного Nexus-сервиса.
   * Архив Ansible-плейбуков и ролей, необходимых для инсталлятора.
   * Архив Inventory-генератора под различные ОС.

* Документация на {var(sys4)}.

## {heading(Распаковка архивов)[id=unpacking_archives]}

Подготовьте архивы:

1. Скачайте архивы, необходимые для установки {var(sys2)}, в директорию из переменной `$NEW_DISTRIB_DIR` (подробнее — в разделе {linkto(../preparation#variables)[text=%text]}).
1. Перейдите на деплой-ноду и проверьте состав архивов дистрибутива:

   ```console
   $ cd $NEW_DISTRIB_DIR
   $ ls
   invgen_box-$NEW_RELEASE_NAME.tar.gz
   invgen_box-$NEW_RELEASE_NAME.tar.gz.sha1sum
   nexus-box-$NEW_RELEASE_NAME.tar
   nexus-box-$NEW_RELEASE_NAME.tar.list
   nexus-box-$NEW_RELEASE_NAME.tar.sha1sum
   repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz
   repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz.sha1sum
   ```
  
1. Описание архивов дистрибутива:

   * `invgen_box-$NEW_RELEASE_NAME.tar.gz` — Inventory-генератор для первичной настройки Inventory.
   * `invgen_box-$NEW_RELEASE_NAME.tar.gz.sha1sum` — чек-сумма архива с Inventory-генератором.
   * `nexus-box-$NEW_RELEASE_NAME.tar` — основной архив.
   * `nexus-box-$NEW_RELEASE_NAME.tar.list` — список архивов и файлов основного архива.
   * `nexus-box-$NEW_RELEASE_NAME.tar.sha1sum` — чек-сумма основного архива.
   * `repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz` — плейбуки для установки и конфигурации {var(sys2)}, а также ряд вспомогательных инструментов.
   * `repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz.sha1sum` — чек-сумма архива с плейбуками.

1. Посчитайте чек-суммы архивов дистрибутива и сравните их с контрольными суммами в файлах `*.sha1sum`.

   <err>

   Подсчет чек-суммы файла `nexus-box-$NEW_RELEASE_NAME.tar` может занять длительное время. Дождитесь окончания процедуры.

   </err>

   {caption(Пример команды для подсчета чек-сумм и вывода контрольных сумм из файлов *.sha1sum)[align=left;position=above]}
   ```console
   $ sha1sum invgen_box-*.tar.gz; cat invgen_box-*.tar.gz.sha1sum; sha1sum nexus-box-*.tar; cat nexus-box-*.tar.sha1sum; sha1sum repos_mcs_distr_box-*.tar.gz; cat repos_mcs_distr_box-*.tar.gz.sha1sum
   2880b4c1ad685291925d9e994009633e1b60882f  invgen_box-$NEW_RELEASE_NAME.tar.gz
   2880b4c1ad685291925d9e994009633e1b60882f  invgen_box-$NEW_RELEASE_NAME.tar.gz
   47e0b706bc3d7ea1bdcb34d7cc6e8349e75f986a  nexus-box-$NEW_RELEASE_NAME.tar
   47e0b706bc3d7ea1bdcb34d7cc6e8349e75f986a  nexus-box-$NEW_RELEASE_NAME.tar
   9541f635daf347deedfa9dd8e25f500f2a4d6e1f  repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz
   9541f635daf347deedfa9dd8e25f500f2a4d6e1f  repos_mcs_distr_box-$NEW_RELEASE_NAME.tar.gz
   ```
   {/caption}

   <err>

   Пары чек-сумм должны совпадать. Иначе использовать данный дистрибутив нельзя. Необходимо перезагрузить битый архив.

   </err>
   
1. Распакуйте архивы.

## {heading(Распаковка архива Nexus)[id=unpacking_nexus_archive]}

<err>

Убедитесь в наличии необходимого объема памяти в директории `/home/<ИМЯ_ПОЛЬЗОВАТЕЛЯ>/` и в директории `/var/lib`. Во время распаковок требуется большой объем памяти.

</err>

Распакуйте архив `nexus-box-*.tar`:

```console
$ tar -xvf nexus-box-${NEW_RELEASE_NAME}.tar
$ cd nexus-box-${NEW_RELEASE_NAME}
```

Чтобы удалить исходный архив, выполните команду:

```console
$ rm -fv $NEW_DISTRIB_DIR/nexus-box-${NEW_RELEASE_NAME}.tar
```

Состав архива:

* `docker-rpms.tar.gz` — архив в rpm-пакетами сервиса Docker для оффлайн-установки.
* `nexus3_3.76.1.tar.gz` — Docker-образ Nexus, сохраненный в архиве.
* `volume-nexus.tar.gz` — архив с данными для Nexus.
* `run_nexus.sh` — скрипт запуска Nexus.

## {heading(Обновление хранилища пакетов Nexus)[id=nexus_package_store_update]}

1. Удалите старый контейнер и том Nexus:

   ```console
   $ sudo docker rm -f nexus3-box-${PREV_RELEASE_NAME}
   $ sudo docker volume rm nexus-box-${PREV_RELEASE_NAME}
   ```
   
1. Уберите ограничение по ОЗУ для Nexus, чтобы ускорить его работу:

   ```console
   $ sed -i 's/--memory="2800m"//g' ./run_nexus.sh
   ```

1. Запустите скрипт `run_nexus.sh`:

   ```console
   $ sudo ./run_nexus.sh | tee ~/run_nexus_${NEW_RELEASE_NAME}.out
   ```

После успешного выполнения скрипта сохраните пароль администратора для доступа к серверу Nexus, выведенный:

* В строке `NEXUS ADMIN PASSWORD IS: <PASSWORD>`.
* В файл `~/run_nexus.out` на деплой-ноде.

   <warn>

   Удалите файл после сохранения пароля.

   </warn>

При отработке скрипта Ansible обновится до версии `2.9.27-202501120843.cmpt.el7.x86_64`. В новой версии добавлены новые модули, в частности OpenStack:

```console
$ rpm -qa | grep ansible
ansible-2.9.27-202501120843.cmpt.el7.x86_64
```