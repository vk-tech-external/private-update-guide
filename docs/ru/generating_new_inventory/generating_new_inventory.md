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
   $ chmod +x invgen-${INVGEN_ARCH}
   $ ./invgen-${INVGEN_ARCH} config-example > ~/minimal_${NEW_RELEASE_NAME}.yml
   ```
  
1. Заполните полученный файл актуальными для {var(sys2)} значениями.

## {heading(Корректировка файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_edit]}

Перейдите в директорию новой версии дистрибутива и запустите скрипт `pre_upgrade.py`:

```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml

$ ./pre_upgrade.py \
  --invgen-path $PREV_DISTRIB_DIR/invgen_box-$PREV_RELEASE_NAME/invgen-$INVGEN_ARCH \
  -o $PREV_INVENTORY_DIR/vkcloud \
  -n ~/minimal_${NEW_RELEASE_NAME}.yml
```

В командной строке отобразится следующая информация:

* Переменные, которые были изменены после генерации при установке {var(sys2)} 4.0. Сохраните их для переноса переменных после генерации Inventory для {var(sys2)} 4.1.

   {caption(Пример)[align=left;position=above]}
   ```yml
   +default_innodb_buffer_pool_size: 3221225472 # vkcloud/group_vars/vkcloud/common.yml
   -default_innodb_buffer_pool_size: 805306368 # vkcloud/group_vars/vkcloud/common.yml
   +mysql|max_connections: 10000 # vkcloud/group_vars/vkcloud_galera_barbican/vars.yml
   -mysql|max_connections: 100 # vkcloud/group_vars/vkcloud_galera_barbican/vars.yml
   +mysql|max_connections: 30000 # vkcloud/group_vars/vkcloud_galera_billingaccountservice/vars.yml
   -mysql|max_connections: 300 # vkcloud/group_vars/vkcloud_galera_billingaccountservice/vars.yml
   ```
   {/caption}

* Параметры, устаревшие для {var(sys2)} 4.1. Удалите их из файла `minimal.yml` новой версии.

   {caption(Пример)[align=left;position=above]}
   ```yaml
   vars:
   keycloak_ldap_admins_groupsDn: cn=groups,cn=accounts,{{ keycloak_ldap_basedn }}
   keycloak_ldap_admins_search: (memberof=cn=ldap_admins,cn=groups,cn=accounts,{{ keycloak_ldap_basedn }})
   keycloak_ldap_admins_usersDn: cn=users,cn=accounts,{{ keycloak_ldap_basedn }}
   keycloak_ldap_basedn: dc=vk,dc=team
   keycloak_ldap_fullsync_period: 300
   keycloak_ldap_host: ldap.{{ stand_domain_name }}
   ```
   {/caption}

   <err>

   Если в устаревших параметрах присутствует строка `host_templates: {}`, не удаляйте её из Inventory для {var(sys2)} 4.1.

   </err>
* Параметры требований установки, новые для {var(sys2)} 4.1. Добавьте их в файл `minimal.yml` новой версии.

   {caption(Пример)[align=left;position=above]}
   ```yaml
   components:
   - rs
   - freeipa
   - network
   - sprut
   - maas
   - laas
   equipment:
   evh: 0
   groups:
   private_dns:
   - kcn001
   ```
   {/caption}

<warn>

Сохраните полученные данные для дальнейшего использования.

</warn>

## {heading(Восстановление файла minimal.yml {var(sys2)} 4.0)[id=minimal_file_restoring]}

Если файл `minimal.yml`, подготовленный для {var(sys2)} 4.0, был утерян, восстановите его:

```console
$ ./restore_minimal_yaml.py -i $PREV_INVENTORY_DIR/vkcloud/ -f ~/minimal.yml --write
$ head ~/minimal.yml
components:
- cloud_audit_logs
- highiops
- magnum
- octavia
- trove
- postfix
- manila
- xaas
equipment:
```

<!--- // todo подумать над формулировкой -->

Проверьте, что значения переменных в файле корректны для установленной {var(sys2)} 4.0.

## {heading(Слияние файлов minimal.yml разных версий)[id=merging_different_versions_minimal_files]}

Внесите в файл `minimal.yml` новой версии изменения в соответствии с рекомендациями, полученными в результате выполнения скрипта `pre_upgrade.py` (подробнее — в разделе {linkto(#new_version_minimum_configuration_edit)[text=%text]}):

1. Откройте файл `minimal.yml`:

   ```console
   $ vi ~/minimal.yml
   ```
   
1. Удалите устаревшие для {var(sys2)} 4.1 данные, сверяясь со списком из раздела {linkto(#new_version_minimum_configuration_edit)[text=%text]}.
1. Добавьте новые переменные для {var(sys2)} 4.1 в `minimal.yml`, сверяя их с потребностями установки (например, может не потребоваться активация сервисов MaaS/LaaS и перенос их на evh-хост и т. д.).

<info>

Если нужно пояснение за что отвечает переменная, посмотрите описание в оригинальном файле `minimal.yml` для {var(sys2)} 4.1:

```console
$ grep -B7 ceph_mon_hosts ~/minimal_${NEW_RELEASE_NAME}.yml

### Расположение компонентов MON/MGR/MDS по Ceph-кластеру
  # Получение: Самостоятельно выбрать согласно спецификации Ceph-кластера
  # Доп. информация: Переменная актуальна только если количество Ceph-узлов больше трёх. В ином случае переменная игнорируется
  # Доп. информация: Списком перечисляйте номера Ceph-узлов, начиная с `1` и строго по возрастанию
  # Доп. информация: По рекомендации архитектуры Ceph — данных узлов должно быть нечётное количество
  # Доп. информация: Пример ниже — разворачивать MON/MGR/MDS на хостах csn002, csn004 и csn005
  ceph_mon_hosts: [2, 4, 5]
```

</info>

## {heading(Генерация Inventory)[id=inventory_generation]}

Сгенерируйте новый Inventory из полученного файла `minimal.yml`:

```console
$ $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH generate -config ~/minimal.yml -target ~/inventory-$NEW_RELEASE_NAME
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
$ ./vault_migration.py --source $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml --target ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
```

Измените значение переменной `vault_ceph_admin_key` на содержимое переменной `vault_ceph_admin_glance_tmp` в файле `~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml`.

При необходимости закодируйте обе версии обратно после миграции vault-файла:

```console
$ ansible-vault encrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
$ ansible-vault encrypt ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
```