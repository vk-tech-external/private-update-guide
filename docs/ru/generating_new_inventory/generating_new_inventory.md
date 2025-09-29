# {heading(Генерация нового Inventory)[id=generating_new_inventory]}

## {heading(Получение файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_get]}

**При обновлении {var(sys2)} с версии 4.1.1:**

1. Разархивируйте новую версию Inventory-генератора:

   ```console
   $ cd $NEW_DISTRIB_DIR
   $ tar xvf invgen_box-${NEW_RELEASE_NAME}.tar.gz
   ```
  
1. Сгенерируйте новый файл минимальной конфигурации:

   ```console
   $ cd $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME
   $ chmod +x invgen-$INVGEN_ARCH
   $ ./invgen-${INVGEN_ARCH} config-example > ~/minimal_${NEW_RELEASE_NAME}.yml
   ```

1. Заполните полученный файл (`~/minimal_${NEW_RELEASE_NAME}.yml`) актуальными для {var(sys)} 4.2.2 значениями.

**При обновлении {var(sys2)} с версии 4.2.0:**

Если есть файл `minimal.yml` для версии 4.2.0, скопируйте его с указанием нового имени релиза:

   ```console
   $ cp ~/minimal.yml ~/minimal_${NEW_RELEASE_NAME}.yml
   ```

Если нет файла `minimal.yml` для версии 4.2.0, выполните шаги, как при обновлении {var(sys2)} с версии 4.1.1.

## {heading(Корректировка файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_edit]}

### {heading(Корректировка файла)[id=configuration_edit]}

Перейдите в директорию новой версии дистрибутива и запустите скрипт `pre_upgrade.py`:

{caption(Скрипт при обновлении с версии 4.1.1)[align=left;position=above]}
```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml/

$ ./pre_upgrade.py \
--invgen-path $PREV_DISTRIB_DIR/invgen_box-$PREV_RELEASE_NAME/invgen-$INVGEN_ARCH \
--invgen-path-release $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH \
-o $PREV_INVENTORY_DIR/vkcloud \
-n ~/minimal_$NEW_RELEASE_NAME.yml \
--prev-version ${PREV_RELEASE_NAME}
```
{/caption}

{caption(Скрипт при обновлении с версии 4.2.0)[align=left;position=above]}
```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml/

$ ./pre_upgrade.py \
--invgen-path $PREV_DISTRIB_DIR/invgen_box-$PREV_RELEASE_NAME/invgen-$INVGEN_ARCH \
--invgen-path-release $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH \
-o $PREV_INVENTORY_DIR/vkcloud \
-n ~/minimal_$NEW_RELEASE_NAME.yml \
--prev-version ${PREV_RELEASE_NAME}
--ask-vault-pass
```
{/caption}

В командной строке скрипт выведет следующую информацию:

* Переменные, которые были изменены после генерации Inventory при установке {var(sys)} предыдущей версии. Сохраните их для переноса переменных после генерации Inventory для {var(sys)} 4.2.2.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
   ℹ️ Внимание, эти файлы были изменены:
   ----------------------------------------------------------

   Обнаружены изменения в файле /vkcloud.yml

   ❌ Во второй инвентори были удалены следующие переменные:
   'all.children.vkcloud.children.vkcloud_evpn.hosts.network1: {''evpn_address'': ''10.30.3.23''}'

   'all.children.vkcloud.children.vkcloud_control_plane.children.vkcloud_dhcp.hosts.network1:
   None'

   'all.children.vkcloud.children.vkcloud_control_plane.children.vkcloud_network.hosts.network1:
   None'

   'all.children.vkcloud.children.vkcloud_control_plane.children.vkcloud_sprut.children.vkcloud_sprut_network.hosts.network1:
   None'

   ----------------------------------------------------------

   Обнаружены изменения в файле /hosts.yml

   ✅ Добавлены новые переменные во второй инвентори:
   {
      "groups": {
         "network": [
            "cpn001",
            "cpn002",
            "cpn003"
         ]
      }
   }
   ...
   ```
   {/caption}

* Параметры, устаревшие для {var(sys)} 4.2.2. Удалите их из файла `minimal.yml` новой версии.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
   ℹ️  Эти переменные больше не актуальны в minimal.yml:

   vars:
      ## Общая внешняя сеть
      ## Имя первой, внешней сети
      # Получение: Столбец "Наименование" в пункте №7 таблицы 2.2 Паспорта
      # Доп. информация: Под данным именем будет отображать Внешняя сеть для пользователей
      # Доп. информация: Используйте только символы из диапазона: a-zA-Z0-9_
   external_network_name: ''

      ## Общая внешняя сеть - Настройки Внешних подсетей
   external_networks_extend:
   -   key: 10.235.1.0/24
       value:
          network_name: provider
          project_id: '{{ breeze_katana_project }}'
          shared: 'True'

      ### Бакеты в случае выбора S3
      # Доп. информация: На момент подключения бакет уже должен быть создан, а ключи внесены в секцию "vault"
      ## Имя бакета для хранения образов Glance
   glance_s3_bucket_name: glance

      ## Имя бакета для временного хранения образов Glance за момент загрузки образа через ЛК
   glance_s3_tmp_bucket_name: glance-tmp

      ### Использовать MinIO в качестве S3
      # Получение: В зависимости наличия иных S3-сервисов
      # Вариации:
      # * "true" - компонент "minio" будет установлен на сервере Monitoring-Logging для хранения резервных копий и для Marketplace;
      # * "false" - компонент "minio" не будет установлен и потребуется задать параметры подключения к внешнему S3 (см. ниже).
   minio_enable: true
   ...
   ```
   {/caption}

* Параметры требований установки, новые для {var(sys)} 4.2.2. Добавьте их в файл `minimal_${NEW_RELEASE_NAME}.yml` новой версии.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
    В minimal.yml появились новые переменные, обратите внимание на корректность их заполнения:

   components:
      ### Суммарное количество серверов с ролью Ceph.
      # Получение: Столбец "Количество серверов" в пункте №5 таблицы 1.4 Паспорта
      # Доп. информация: Возможные варианты: "0", "1", "3", "6", "9"
      # Доп. информация: В конфигурации ниже указан пример на одном Ceph-узле, что актуально только для dev-установок. Для любой
      # другой установки рекомендуется указывать 3 или более Ceph-узлов
   - ceph

   vars:
      ### Сеть Cloud External
      ## Вариант реализации внешней сети:
      # - shared                Создавать общую внешнюю сеть для всех проектов.
      # - per-project           Создавать "провайдерские" сети, то есть выделенные внешние сети
      #                         для каждого из указанных проектов.
      # - dmz32bit_announces    Создавать сеть внешнюю с пирингом по BGP сетей c префиксом /32
   external_network_variant: per-project

      ## Список внешних сетей для использования в продуктивных окружениях
      # Получение: Столбец "Адреса подсети" в пункте №7 таблицы 2.2 Паспорта
   external_networks_predefined:
   ...
   ```
   {/caption}

Проверьте файл `~/minimal_${NEW_RELEASE_NAME}.yml` на валидность, заполните новые переменные.

{note:warn}

Убедитесь, что флаги `kernel_update_enable` и `kernel_upgrade_reboot_enable` имеют состояние `False`. На данном этапе серверы должны быть обновлены и перезагружены.

{/note}

Сохраните полученные данные для дальнейшего использования.

### {heading(Устранение неполадок)[id=new_inventory_possible_problems]}

**Проблема**: При выполнении команды `./pre_upgrade.py` произошла ошибка:

  ```console
  raise AddressValueError('Address cannot be empty')
  ipaddress.AddressValueError: Address cannot be empty
  ```

**Решение:** Закомментируйте переменную `network_address_cloudexternal` в Inventory-файле {var(sys)} предыдущей версии и повторите выполнение команды:

  ```console
  $ vi $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vars.yml
  ...
  #network_address_cloudexternal: ""
  ...
  ```

При работе скрипта это отобразится как изменение в файле, проигнорируйте его и продолжите корректировку Inventory.

## {heading(Восстановление файла minimal.yml {var(sys)} предыдущей версии)[id=minimal_file_restoring]}

Если файл `minimal.yml`, подготовленный для {var(sys)} предыдущей версии, был утерян, восстановите его.

{caption(Команда восстановления файла minimal.yml для версии 4.1.1)[align=left;position=above]}
```console
$  ./restore_minimal_yaml.py -i $PREV_INVENTORY_DIR/vkcloud/ -f ~/minimal_restore.yml --write --prev-version 4.1.1
```
{/caption}

{caption(Команда восстановления файла minimal.yml для версии 4.2.0)[align=left;position=above]}
```console
$  ./restore_minimal_yaml.py -i $PREV_INVENTORY_DIR/vkcloud/ -f ~/minimal_restore.yml --write --prev-version 4.2.0
```
{/caption}

Проверьте, что значения переменных в файле корректны для установленной версии {var(sys)}.

## {heading(Генерация Inventory)[id=inventory_generation]}

Сгенерируйте новый Inventory из полученного файла `minimal_$NEW_RELEASE_NAME.yml`:

```console
$ $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH generate -config ~/minimal_$NEW_RELEASE_NAME.yml -target ~/inventory-$NEW_RELEASE_NAME
```

В сгенерированный Inventory внесите изменения в соответствии с рекомендациями, полученными в предыдущем шаге в выводе скрипта `pre_upgrade.py` в разделе {linkto(#new_version_minimum_configuration_edit)[text=%text]}.

{note:info}

В переменной `postdeploy_provider_network` (файл `group_vars/vkcloud/networks.yml`) изменился шаблон генерации имени подсети. Если в предыдущей версии {var(sys2)} были созданы проекты с сетями, приведите имена подсетей в переменных `postdeploy_provider_network.[project_name].subnet.name` в соответствие с созданными подсетями.

{/note}

## {heading(Обновление файла vault.yml)[id=vault_file_update]}

При необходимости раскодируйте его для обработки скриптом `vault_migration.py`, чтобы провести миграцию vault-файла:

```console
$ cd $PREV_INVENTORY_DIR/vkcloud
$ ansible-vault decrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
```

Перенесите пароли в новый Inventory с помощью скрипта `vault_migration.py`:

```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml
$ ./vault_migration.py --source $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml --target ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml --release 4.2.2
```

{note:err}

После того как скрипт совместит информацию из двух файлов, проверьте корректность всех паролей.

{/note}

При необходимости закодируйте обе версии:

```console
$ ansible-vault encrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
$ ansible-vault encrypt ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
```