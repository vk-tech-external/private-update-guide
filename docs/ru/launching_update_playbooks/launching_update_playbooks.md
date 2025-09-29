# {heading(Запуск плейбуков обновления)[id=launching_update_playbooks]}

## {heading(Подготовка)[id=launching_update_playbooks_preparation]}

Скопируйте директорию с Ansible-плейбуками в Inventory:

```console
$ cp -r $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/ansible-openstack ~/inventory-$NEW_RELEASE_NAME
```

<!--- //todo Только для версии 4.2. Повлечёт за собой другие изменения, т.к. в 4.1  было описано с учётом отсутствия этой информации -->

<!---
== Запуск box.sh с группой upgrade

Запустите обновление:

[source,console]
----
$ cd ~/inventory-$NEW_RELEASE_NAME/vkcloud
../ansible-openstack/tools/box.sh   deploy   -b ../ansible-openstack   -i vkcloud.yml    -s upgrade    -e distro_deploy=true -e env=vkcloud
----
-->

## {heading(Запуск через Ansible OpenStack)[id=ansible_openstack_launching]}

Перейдите в директорию нового Inventory:

```console
$ cd ~/inventory-$NEW_RELEASE_NAME/vkcloud
```

Последовательно запустите плейбуки:

```console
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/pred-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e monitoringenable=false ../ansible-openstack/playbooks/common.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/public_haproxy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/private_haproxy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/kube.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e dev_mfapanel=true ../ansible-openstack/playbooks/opensearch.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e dev_mfapanel=true ../ansible-openstack/playbooks/postfix.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/security.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud --tags monitoring ../ansible-openstack/playbooks/common.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/galera.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/proxysql.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/rabbit-persistent.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true  ../ansible-openstack/playbooks/helm-keycloak.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/breeze-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/dusk-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/cinder-volume-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/cinder-backup-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=yes -e cinder_hiops_disks_autoconfigure=true --skip-tags db -e cinder_controller_deploy=false ../ansible-openstack/playbooks/cinder-volume-scst-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true --skip-tags ceilometer_compute,common_monitoring ../ansible-openstack/playbooks/compute-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/neutron-dhcp-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/glance-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/nova-controller-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-sdn-proxy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-keystone.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-manila-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-octavia-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-billingcore.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-billingcore-billing-notifications.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-billing-account-service.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-nova-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-license-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-cinder-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-sdn-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-cinder-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t bootstrap -e bootstrap=true ../ansible-openstack/playbooks/octavia-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud --skip-tags=gencerts,ssl,bootstrap_db,bootstrap_lbaas_az ../ansible-openstack/playbooks/octavia-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t bootstrap_db -e bootstrap=true ../ansible-openstack/playbooks/octavia-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t gencerts,ssl -e bootstrap=true ../ansible-openstack/playbooks/octavia-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t detect,bootstrap_lbaas_az -e bootstrap=true ../ansible-openstack/playbooks/octavia-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-octavia-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-mcs-admin-ui.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-scrooge.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-nova-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-frontapp-theme.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-frontapp-configuration.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-frontapp.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-karboii-karti.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-celery-zabbix.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/manila-controller-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/manila-share-deploy.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-manila-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-sdn-billing.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-gb-api-gateway.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/clickhouse.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/clickhouse.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t paas ../ansible-openstack/playbooks/imageloader.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-xaas.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-magnum-keystone-auth.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-magnum-gateway.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-magnum.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-magnum-addons.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-magnum-rapid.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -e bootstrap=true ../ansible-openstack/playbooks/helm-trove.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud  ../ansible-openstack/playbooks/helm-magnum-keystone-auth.yml
$ ansible-playbook -i vkcloud.yml  -e env=vkcloud -t addons ../ansible-openstack/playbooks/imageloader.yml
```

## {heading(Обновление Ceph)[id=ceph_update]}

<info>

После каждого прогона Ceph-плейбуков проверяйте стабильность Ceph (ребалансинг, ошибки). Все найденные ошибки необходимо устранить, а при ребалансинге — дождаться его завершения.

</info>

Последовательно запустите следующие плейбуки с указанными параметрами:

```console
$ ansible-playbook -i vkcloud.yml --diff -e env=vkcloud --skip-tags monitoring ../ansible-openstack/playbooks/ceph-osd-deploy.yml
$ ansible-playbook -i vkcloud.yml --diff -e env=vkcloud -t ceph_mgr ../ansible-openstack/playbooks/ceph-osd-deploy.yml
```

## {heading(Перезагрузка гипервизоров с High-IOPS)[id=high_iops_hypervisors_reboot]}

Выполните перезагрузку серверов из группы `vkcloud_scst_iscsi` в Inventory-файле `vkcloud.yml`. Убедитесь, что операционная система загрузилась без ошибок:

```console
$ ssh <SERVER_NAME>
$ sudo shutdown -r now
$ systemctl status | head -n 5
$ systemctl list-units --failed
```

## {heading(Перезапуск ранее запущенных виртуальных машин)[id=vm_reboot]}

При обновлении {var(system)} с версии 4.0.2 до версии 4.1.0 на гипервизорах в файле `/etc/nova/nova.conf` меняется значение параметра `force_config_drive` с `false` на `true`. Из-за этого запущенные до обновления ВМ, которые не используют конфигурационный диск, могут перезапускаться некорректно.

Чтобы восстановить возможность корректного перезапуска, обновите параметры libvirt конфигурации ВМ. На управляющем узле выполните команды:

```console
----
$ sudo -i
# . openrc.sh
# openstack shelve <INSTANCE_ID>
# openstack unshelve <INSTANCE_ID>
```

Здесь `<INSTANCE_ID>` — идентификатор ВМ.

<info>

При выполнении команд происходит отключение ВМ. Если ВМ является частью кластера, выполняйте команды на узлах поочередно, дожидаясь восстановления кластера.

</info>