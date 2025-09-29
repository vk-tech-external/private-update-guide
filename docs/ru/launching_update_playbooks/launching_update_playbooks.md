# {heading(Запуск плейбуков обновления)[id=launching_update_playbooks]}

## {heading(Подготовка)[id=launching_update_playbooks_preparation]}

Скопируйте директорию с Ansible-плейбуками в Inventory:

```console
$ cp -r $NEW_DISTRIB_DIR/repos_mcs_distr_box-$NEW_RELEASE_NAME/ansible-openstack ~/inventory-$NEW_RELEASE_NAME
```

## {heading(Запуск box.sh с группой upgrade)[id=launch_box_upgrade]}

Чтобы получить файл `upgrade`, объедините файл `upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-necessarily` с файлами обновления компонентов `upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-components-<COMPONENT_NAME>`, где `<COMPONENT_NAME>` — название компонента, например `trove`. При этом необходимо учесть:

1. Файл `upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-necessarily` всегда должен стоять как первый аргумент, порядок остальных не важен.

1. Если файла `upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-components-<COMPONENT_NAME>` нет, значит его обновление не требуется.

1. Добавлять файл `upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-components-freeipa` не требуется.

1. При обновлении {var(system)} с версии 4.0 компонент Ceph необходимо обновить отдельно (подробнее — в разделе {linkto(#ceph_update)}). Чтобы исключить обновление Ceph на данном этапе, в файле `upgrade-4.0.2-4.1.1-necessarily` закомментируйте строки:

   ```console
   ceph-osd-deploy.yml|--skip-tags=monitoring -e ceph_osd_disks_autoconfigure=true|redos
   ceph-osd-deploy.yml|-t ceph_mgr|redos
   ```

Чтобы выполнить обновление:

1. Получите файл `upgrade`:

   ```console
   $ cd ~/inventory-$NEW_RELEASE_NAME/tools/box.sh.d/groups/
   $ cat upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-necessarily upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-components-trove \
   upgrade-${PREV_RELEASE_NAME}-${NEW_RELEASE_NAME}-components-xaas > upgrade
   ```

1. Запустите обновление:

   ```console
   $ cd ~/inventory-$NEW_RELEASE_NAME/vkcloud
   $ ../ansible-openstack/tools/box.sh deploy -b ../ansible-openstack -i vkcloud.yml -s upgrade -e distro_deploy=true -e env=vkcloud
   ```

## {heading(Обновление Ceph)[id=ceph_update]}

<warn>

Выполните только при обновлении {var(system)} с версии 4.0.

</warn>

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

При обновлении {var(sys2)} на гипервизорах в файле `/etc/nova/nova.conf` меняется значение параметра `force_config_drive` с `false` на `true`. Из-за этого запущенные до обновления ВМ, которые не используют конфигурационный диск, могут перезапускаться некорректно.

Чтобы восстановить возможность корректного перезапуска, обновите параметры libvirt конфигурации ВМ. На управляющем узле выполните команды:

```console
$ sudo -i
# . openrc.sh
# openstack shelve <INSTANCE_ID>
# openstack unshelve <INSTANCE_ID>
```

Здесь `<INSTANCE_ID>` — идентификатор ВМ.

<info>

При выполнении команд происходит отключение ВМ. Если ВМ является частью кластера, выполняйте команды на узлах поочередно, дожидаясь восстановления кластера.

</info>