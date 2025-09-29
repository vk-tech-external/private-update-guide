# {heading(Обновление Inventory)[id=generating_new_inventory]}

## {heading(Изменение Inventory при обновлении с версии 4.0)[id=inventory_generating_4.0]}

### {heading(Получение файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_get]}

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

### {heading(Корректировка файла минимальной конфигурации новой версии)[id=new_version_minimum_configuration_edit]}

Перейдите в директорию новой версии дистрибутива и запустите скрипт `pre_upgrade.py`:

```console
$ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml

$ ./pre_upgrade.py \
  --invgen-path $PREV_DISTRIB_DIR/invgen_box-$PREV_RELEASE_NAME/invgen-$INVGEN_ARCH \
  -o $PREV_INVENTORY_DIR/vkcloud \
  -n ~/minimal_${NEW_RELEASE_NAME}.yml
```

В командной строке отобразится следующая информация:

* Переменные, которые были изменены после генерации при установке {var(system)} 4.0 Сохраните их для переноса переменных после генерации Inventory для {var(system)} 4.1.1.

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

* Параметры, устаревшие для {var(system)} 4.1.1. Удалите их из файла `minimal.yml` новой версии.

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

   Если в устаревших параметрах есть строка `host_templates: {}`, не удаляйте ее из Inventory для {var(system)} 4.1.1.

   </err>
  
* Параметры требований установки, новые для {var(system)} 4.1.1. Добавьте их в файл `minimal.yml` новой версии.

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

### {heading(Восстановление файла minimal.yml {var(system)} 4.0)[id=minimal_file_restoring]}

Если файл `minimal.yml`, подготовленный для {var(system)} 4.0, был утерян, восстановите его:

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

Проверьте, что значения переменных в файле корректны для установленной {var(system)} 4.0.

### {heading(Слияние файлов minimal.yml разных версий)[id=merging_different_versions_minimal_files]}

Внесите в файл `minimal.yml` новой версии изменения в соответствии с рекомендациями, полученными в результате выполнения скрипта `pre_upgrade.py` (подробнее — в разделе {linkto(#new_version_minimum_configuration_edit)[text=%text]}):

1. Откройте файл `minimal.yml`:

   ```console
   $ vi ~/minimal.yml
   ```
   
1. Удалите устаревшие для {var(system)} 4.1.1 данные, сверяясь со списком из раздела {linkto(#new_version_minimum_configuration_edit)[text=%text]}.
1. Добавьте новые переменные для {var(system)} 4.1.1 в `minimal.yml`, сверяя их с потребностями установки (например, может не потребоваться активация сервисов MaaS/LaaS и перенос их на evh-хост и т. д.).

<info>

Чтобы узнать функцию переменной, посмотрите описание в оригинальном файле `minimal.yml` для {var(system)} 4.1.1:

```console
$ grep -B7 ceph_mon_hosts ~/minimal_${NEW_RELEASE_NAME}.yml

### Расположение компонентов MON/MGR/MDS по Ceph-кластеру
  # Получение: Самостоятельно выбрать согласно спецификации Ceph-кластера
  # Доп. информация: Переменная актуальна только если количество Ceph-узлов больше трех. В ином случае переменная игнорируется
  # Доп. информация: Списком перечисляйте номера Ceph-узлов, начиная с `1` и строго по возрастанию
  # Доп. информация: По рекомендации архитектуры Ceph — данных узлов должно быть нечетное количество
  # Доп. информация: Пример ниже — разворачивать MON/MGR/MDS на хостах csn002, csn004 и csn005
  ceph_mon_hosts: [2, 4, 5]
```

</info>

### {heading(Генерация Inventory)[id=inventory_generation]}

Сгенерируйте новый Inventory из полученного файла `minimal.yml`:

```console
$ $NEW_DISTRIB_DIR/invgen_box-$NEW_RELEASE_NAME/invgen-$INVGEN_ARCH generate -config ~/minimal.yml -target ~/inventory-$NEW_RELEASE_NAME
```

В сгенерированный Inventory внесите изменения в соответствии с рекомендациями, полученными на предыдущем шаге в выводе скрипта `pre_upgrade.py` в разделе {linkto(#new_version_minimum_configuration_edit)[text=%text]}.

### {heading(Обновление файла vault.yml)[id=vault_file_update]}

1. При необходимости раскодируйте файл `vault.yml` для обработки скриптом `vault_migration.py`, чтобы выполнить миграцию:

   ```console
   $ ansible-vault decrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
   ```

1. Перенесите пароли в новый Inventory с помощью скрипта `vault_migration.py`:

   ```console
   $ cd $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/upgrade/minimal_yml
   $ ./vault_migration.py --source $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml --target ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
   ```

1. В файле `~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml` измените значение переменной `vault_ceph_admin_key` на содержимое переменной `vault_ceph_admin_glance_tmp`.

1. При необходимости закодируйте обе версии после миграции vault-файла:

   ```console
   $ ansible-vault encrypt $PREV_INVENTORY_DIR/vkcloud/group_vars/vkcloud/vault.yml
   $ ansible-vault encrypt ~/inventory-$NEW_RELEASE_NAME/vkcloud/group_vars/vkcloud/vault.yml
   ```

## {heading(Изменение Inventory при обновлении с версии 4.1)[id=inventory_generating_4.1.0]}

Внесите изменения в файлы:

1. В файле `group_vars/vkcloud/addresses.yml` добавьте строку:

   ```console
   kube_management_address: '{{ ansible_facts[netname_to_iface.internal][''ipv4''][''address''] }}'
   ```

1. В файле `group_vars/vkcloud/imageloader.yml` удалите фрагмент:

   ```console
   - name: PostgresProEnterprise-14-2024-04-12_10-45-03
   - name: PostgresPro-14-2024-04-12_10-45-03
   - name: PostgreSQL-14-2024-04-11_14-02-00
     properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgresProEnterprise-14-2024-04-12_10-45-03'', ''os_distro'': ''centos-stream8'', ''os_type'': ''linux'', ''os_version'': ''8'', ''trove_datastore_name'': ''postgrespro_enterprise'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
     properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgresPro-14-2024-04-12_10-45-03'', ''os_distro'': ''centos-stream8'', ''os_type'': ''linux'', ''os_version'': ''8'', ''trove_datastore_name'': ''postgrespro'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
     properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgreSQL-14-2024-04-11_14-02-00'', ''os_distro'': ''alma85'', ''os_type'': ''linux'', ''os_version'': ''8.5'', ''trove_datastore_name'': ''postgresql'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
     location: '{{ yum_repos_url }}/share/osimages/PostgresProEnterprise-14-2024-04-12_10-45-03.gz'
     location: '{{ yum_repos_url }}/share/osimages/PostgresPro-14-2024-04-12_10-45-03.gz'
     location: '{{ yum_repos_url }}/share/osimages/PostgreSQL-14-2024-04-11_14-02-00.gz'
   ```

1. В секцию `glance_service_images` файла `group_vars/vkcloud/imageloader.yml` добавьте фрагмент:

   ```console
   - name: PostgreSQL-14-2024-08-12_08-41-12
   format: raw
   location: '{{ yum_repos_url }}/share/osimages/PostgreSQL-14-2024-08-12_08-41-12.gz'
   required_by: trove
   properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgreSQL-14-2024-08-12_08-41-12'', ''os_distro'': ''alma85'', ''os_type'': ''linux'', ''os_version'': ''8.5'', ''trove_datastore_name'': ''postgresql'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
   - name: PostgresPro-14-2024-08-12_12-35-41
     format: raw
     location: '{{ yum_repos_url }}/share/osimages/PostgresPro-14-2024-08-12_12-35-41.gz'
     required_by: trove
     properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgresPro-14-2024-08-12_12-35-41'', ''os_distro'': ''centos-stream8'', ''os_type'': ''linux'', ''os_version'': ''8'', ''trove_datastore_name'': ''postgrespro'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
   - name: PostgresProEnterprise-14-2024-08-12_12-35-41
     format: raw
     location: '{{ yum_repos_url }}/share/osimages/PostgresProEnterprise-14-2024-08-12_12-35-41.gz'
     required_by: trove
     properties: '{{ glance_default_trove_image_props | combine ({ ''mcs_name'': ''PostgresProEnterprise-14-2024-08-12_12-35-41'', ''os_distro'': ''centos-stream8'', ''os_type'': ''linux'', ''os_version'': ''8'', ''trove_datastore_name'': ''postgrespro_enterprise'', ''trove_datastore_version'': ''14'', ''trove_ga_version'': ''1.13.38'' }) }}'
   ```

1. В файле `group_vars/vkcloud/trove.yml` замените строки:

    * `"14": PostgreSQL-14-2024-04-11_14-02-00` на `"14": PostgreSQL-14-2024-08-12_08-41-12`.
    * `"14": PostgresPro-14-2024-04-12_10-45-03` на `"14": PostgresPro-14-2024-08-12_12-35-41`.
    * `"14": PostgresProEnterprise-14-2024-04-12_10-45-03` на `"14": PostgresProEnterprise-14-2024-08-12_12-35-41`.

1. В файле `group_vars/vkcloud/versions.yml` замените строки:

    * `helm_auth_service: 4.0.0-rc-20230426-202405270909.git4ed31f79` на `helm_auth_service: 4.1.0-20240920`.
    * `mcs_admin_ui_helm_version: v4.1.4-private-rc` на `mcs_admin_ui_helm_version: v4.1.5-private-rc`.
    * `qa_test_images: 4.1.23` на `qa_test_images: 4.1.27.1`.
    * `dusk: 4.1.0-1` на `dusk: 4.1.1-1`.

1. В файле `group_vars/vkcloud/zabbix.yml` удалите фрагмент:

   ```console
   Clickhouse:
     meta:
       - eventhouse
     templates:
       - Clickhouse
   ```

1. В файле `group_vars/vkcloud_kube/auth-service.yml` добавьте фрагмент:

   ```console
   helm_AUTH_SERVICE_MFA_OTP_TRIES_LIMIT: 5
   helm_AUTH_SERVICE_MFA_OTP_TRIES_LIMIT_ENABLED: true
   ```

1. В файле `group_vars/vkcloud_kube/keycloak.yml` замените фрагмент:

   {caption(Исходный фрагмент)[align=left;position=above]}
   ```console
   helm_keycloak_java_opts_append: -Djboss.as.management.blocking.timeout={{ helm_keycloak_dpl_timeout }} -Djgroups.dns.query={{ helm_keycloak_jgroups_dns_query }}
   ```
   {/caption}

   {caption(Новый фрагмент)[align=left;position=above]}
   ```console
   helm_keycloak_java_opts_append: -Djboss.as.management.blocking.timeout={{ helm_keycloak_dpl_timeout }} -Djgroups.dns.query={{ helm_keycloak_jgroups_dns_query }} -Djavax
   .net.ssl.trustStore=/etc/pki/ca-trust/extracted/java/cacerts
   ```
   {/caption}

1. В файле `group_vars/vkcloud_kube/projects-service-proxy.yml` добавьте фрагмент:

   ```console
   helm_PROJECTS_SERVICE_PROXY_BREEZE_REQUIRED_MASTERS: 1
   helm_PROJECTS_SERVICE_PROXY_BREEZE_REQUIRED_REPLICAS: 0
   ```

1. В файле `group_vars/vkcloud_kube/services_manager.yml` добавьте фрагмент:

   ```console
   helm_SERVICES_MANAGER_MCS_BREEZE_REQUIRED_REPLICAS: 0
   helm_SERVICES_MANAGER_MCS_BREEZE_REQUIRED_MASTERS: 1
   ```

1. В файле `group_vars/vkcloud_kube/users-service.yml` добавьте фрагмент:

   ```console
   helm_USERS_SERVICE_BREEZE_REQUIRED_MASTERS: 1
   helm_USERS_SERVICE_BREEZE_REQUIRED_REPLICAS: 0
   ```

1. В файле `group_vars/vkcloud_ost_kube/vars.yml` добавьте строку:

   ```console
   kubelet_readonly_port: 0
   ```

1. В секцию `proxy` файла `host_vars/vkcloud_backends/public_mcs-admin-ui.yml` добавьте фрагмент:

   ```console
   backend_custom_settings: |
   acl sa_openstack_api path_beg -i /admin/api/openstack/8774/ # nova
   acl sa_openstack_api path_beg -i /admin/api/openstack/8776/ # cinder
   acl sa_openstack_api path_beg -i /admin/api/openstack/8786/ # manila
   acl sa_openstack_api path_beg -i /admin/api/openstack/5000/ # keystone
   acl sa_openstack_api path_beg -i /admin/api/openstack/8778/ # nova-placement
   acl sa_openstack_api path_beg -i /admin/api/openstack/9292/ # glance
   acl sa_openstack_api path_beg -i /admin/api/openstack/8779/ # trove / not used
   acl sa_openstack_api path_beg -i /admin/api/openstack/9876/ # octavia
   acl sa_openstack_api path_beg -i /admin/api/openstack/9696/ # neutron
   acl sa_openstack_api path_beg -i /admin/api/openstack/2116/ # sprut
   acl sa_openstack_api path_beg -i /admin/api/openstack/9511/ # magnum
   acl sa_openstack_api path_beg -i /admin/api/openstack/9311/ # barbican
   acl sa_openstack_prefix path_beg -i /admin/api/openstack/
   http-request del-header X-Region-Api-Proxy-Domain if sa_openstack_prefix !sa_openstack_api
   ```
