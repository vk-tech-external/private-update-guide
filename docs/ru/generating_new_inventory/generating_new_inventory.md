# {heading(Генерация нового Inventory)[id=generating_new_inventory]}

## {heading(Получение файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_get]}

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

1. Заполните полученный файл (`~/minimal_${NEW_RELEASE_NAME}.yml`) актуальными для {var(sys2)} {var(version_new)} значениями.

## {heading(Корректировка файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_edit]}

### {heading(Корректировка файла)[id=configuration_edit]}

Перейдите в директорию новой версии дистрибутива и запустите скрипт `pre_upgrade.py`:

```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml/
 
$ ./pre_upgrade.py \
  --invgen-path $PREV_DISTRIB_DIR/invgen_box-$PREV_RELEASE_NAME/invgen-$INVGEN_ARCH \
  -o $PREV_INVENTORY_DIR/vkcloud \
  -n ~/minimal_$NEW_RELEASE_NAME.yml --prev-version ${PREV_RELEASE_NAME}
```

В командной строке скрипт выведет следующую информацию:

* Переменные, которые были изменены после генерации Inventory при установке {var(sys2)} {var(version_prev)}. Сохраните их для переноса переменных после генерации Inventory для {var(sys2)} {var(version_new)}.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
   ⚠️⚠️⚠️ Внимание, эти файлы были изменены:
   ----------------------------------------------------------
       
   📂 Обнаружены изменения в файле /vkcloud.yml
   ⚠️🔑 Изменения в переменных:
   all.children.vkcloud.children.vkcloud_etcd_cluster.children.vkcloud_maas_etcd_cluster.hosts.etcd-maas-node1.etcd_ip: "current value": "10.30.3.27", "new value": "10.30.3.11"
   all.children.vkcloud.children.vkcloud_etcd_cluster.children.vkcloud_maas_etcd_cluster.hosts.etcd-maas-node2.etcd_ip: "current value": "10.30.3.28", "new value": "10.30.3.12"
   all.children.vkcloud.children.vkcloud_etcd_cluster.children.vkcloud_maas_etcd_cluster.hosts.etcd-maas-node3.etcd_ip: "current value": "10.30.3.29", "new value": "10.30.3.13"
   ❌ В новой версии были удалены следующие переменные:
   'all.children.vkcloud.children.vkcloud_control_plane.children.vkcloud_rs.hosts.rs1:
     {''bird_source_ip'': ''10.30.3.19''}'
    
   'all.children.vkcloud.children.vkcloud_freeipa.hosts.freeipa1: {''ansible_host'':
     ''rs1''}'
     
   ----------------------------------------------------------
    
   📂 Обнаружены изменения в файле /hosts.yml
   ❌ В новой версии были удалены следующие значения переменных:
   groups:
     freeipa:
     - rs1...
   ```
   {/caption}

* Параметры, устаревшие для {var(sys2)} {var(version_new)}. Удалите их из файла `minimal.yml` новой версии.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
   ⚠️🔑 Изменения в переменных:
   dev_az: "current value": "ME1", "new value": ""
  
   👇 ℹ️  Эти переменные больше не актуальны в minimal.yml:
   
   vars:
     ## Общая внешняя сеть
     ## Имя первой, внешней сети
     # Получение: Столбец "Наименование" в пункте №7 таблицы 2.2 Паспорта
     # Доп. информация: Под данным именем будет отображать Внешняя сеть для пользователей
     # Доп. информация: Используйте только символы из диапазона: a-zA-Z0-9_
   external_network_name: external
  
     ## Общая внешняя сеть - Настройки Внешних подсетей
   external_networks_extend:
   -   key: 10.31.0.0/16
       value:
          allocation_pools:
             end: 10.31.253.254
             start: 10.31.1.0
          enable_dhcp: true
          gateway_ip: '{{ (external_network_mode == ''bgp'')|ternary(''10.31.255.254'',
             ''10.31.0.22'') }}'
          network_name: '{{ external_network_name }}'
          project_id: '{{ breeze_katana_project }}'
          shared: 'True'
          vlan: 4006...
   ```
   {/caption}

* Параметры требований установки, новые для {var(sys2)} {var(version_new)}. Добавьте их в файл `minimal_${NEW_RELEASE_NAME}.yml` новой версии.

   {caption(Пример выведенной информации после работы скрипта)[align=left;position=above]}
   ```sh
   👇 В minimal.yml появились новые переменные, обратите внимание на корректность их заполнения:
    
   components:
     ### Суммарное количество серверов с ролью Ceph.
     # Получение: Столбец "Количество серверов" в пункте №5 таблицы 1.4 Паспорта
     # Доп. информация: Возможные варианты: "1", "3", "6", "9"
     # Доп. информация: В конфигурации ниже указан пример на одном Ceph-узле, что актуально только для dev-установок. Для любой
     # другой установки рекомендуется указывать 3 или более Ceph-узлов
   - ceph
  
   vars:
     ## Сеть Cloud External
     ### Параметры сети Cloud External
     ## Вариант реализации внешней сети:
     # - shared        Создавать общую внешнюю сеть для всех проектов.
     # - per-project   Создавать "провайдерские" сети, то есть выделенные внешние сети
     #                 для каждого из указанных проектов.
   external_network_variant: per-project
   ...
   ```
   {/caption}

Проверьте файл `~/minimal_${NEW_RELEASE_NAME}.yml` на валидность, заполните новые переменные. Убедитесь, что флаги `kernel_update_enable` и `kernel_upgrade_reboot_enable` находятся в состоянии `False`. Сервера на данном этапе должны быть обновлены и перезагружены.

<warn>

Сохраните полученные данные для дальнейшего использования.

</warn>

### {heading(Устранение неполадок)[id=new_inventory_possible_problems]}

**Проблема**: При выполнении команды `./pre_upgrade.py` произошла ошибка:

  ```console
  raise AddressValueError('Address cannot be empty')
  ipaddress.AddressValueError: Address cannot be empty
  ```

**Решение:** Закомментируйте переменную `network_address_cloudexternal` в Inventory-файле {var(sys2)} {var(version_prev)} и повторите выполнение команды:

  ```console
  $ vi $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vars.yml
  ...
  #network_address_cloudexternal: ""
  ...
  ```

При работе скрипта это отобразится как изменение в файле, проигнорируйте его и продолжите корректировку Inventory.

## {heading(Восстановление файла minimal.yml {var(sys2)} {var(version_prev)})[id=minimal_file_restoring]}

Если файл `minimal.yml`, подготовленный для {var(sys2)} {var(version_prev)}, был утерян, восстановите его:

```console
$  ./restore_minimal_yaml.py -i $PREV_INVENTORY_DIR/vkcloud/ -f ~/minimal_restore.yml --write --prev-version {var(version_prev)}
```

Проверьте, что значения переменных в файле корректны для установленной {var(sys2)} {var(version_prev)}.

## {heading(Генерация Inventory)[id=inventory_generation]}

Сгенерируйте новый Inventory из полученного файла `minimal_$NEW_RELEASE_NAME.yml`:

```console
$ $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH generate -config ~/minimal_$NEW_RELEASE_NAME.yml -target ~/inventory-$NEW_RELEASE_NAME
```

В сгенерированный Inventory внесите изменения в соответствии с рекомендациями, полученными в предыдущем шаге в выводе скрипта `pre_upgrade.py` в разделе {linkto(#new_version_minimum_configuration_edit)[text=%text]}.

## {heading(Обновление файла vault.yml)[id=vault_file_update]}

При необходимости раскодируйте его для обработки скриптом `vault_migration.py`, чтобы провести миграцию vault-файла:

```console
$ ansible-vault decrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
```

Перенесите пароли в новый Inventory с помощью скрипта `vault_migration.py`:

```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml
$ ./vault_migration.py --source $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml --target ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml --release {var(version_new)}
```

<err>

После того как скрипт совместит информацию из двух файлов, проверьте корректность всех паролей.

</err>

При необходимости закодируйте обе версии:

```console
$ ansible-vault encrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
$ ansible-vault encrypt ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
```