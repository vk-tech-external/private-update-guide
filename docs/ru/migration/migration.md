# {heading(Процедура миграции пользовательской нагрузки перед перезагрузкой узлов)[id=migration]}

## {heading(Миграция ВМ с вычислительных узлов перед перезагрузкой)[id=migration_compute]}

Перед перезагрузкой вычислительных узлов (гипервизоров) для обеспечения работы ВМ освободите вычислительный узел.

Обслуживание вычислительных узлов описано в разделах документа **Руководство администратора {var(system)}**:

* **Администрирование** → **Управление инфраструктурой** → **Управление вычислительными узлами (гипервизорами)**.
* **Облачные вычисления** → **Работа с ВМ** → **Миграция ВМ**.

Пример «живой» миграции с вычислительного узла перед перезагрузкой:

{note:info}

В примере действия выполняются на вычислительном узле `kcn001`.

{/note}

1. Подключитесь к управляющему узлу с файлом конфигурации `openrc.sh`:

   ```console
   $ ssh cpn003
   $ sudo -i
   # source ~/openrc.sh
   ```

1. Отключите сервис nova-compute на вычислительном узле, чтобы на нем не создавались новые ВМ:

   ```console
   # openstack compute service set --disable --disable-reason "maintenance" kcn001 nova-compute
   ```

1. Получите список ВМ для миграции на узле, который будет перезагружен:

   ```console
   # openstack server list --all --long --host kcn001
   ```

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack server list -f value --all --long --host kcn001
    
   fb010714-ead6-46f4-8dfb-ee27ce0970e5 centos_Basic-1-1_10GB_3 ACTIVE None 1 {'local-net': ['192.168.100.4', '10.31.1.34']} N/A (booted from volume) N/A (booted from volume) Basic-1-1 dac0c7ba-a78f-4fb5-a96a-e537937e935a AZ1 kcn001 {'service_user_id': 'c49c389fd5bc46b1bbfb288fb74c2a4c'}
   e43ae734-9d8c-4e74-a5f0-525b387a5320 centos_Basic-1-1_10GB ACTIVE None 1 {'local-net': ['192.168.100.21', '10.31.1.29']} N/A (booted from volume) N/A (booted from volume) Basic-1-1 dac0c7ba-a78f-4fb5-a96a-e537937e935a AZ1 kcn001 {'service_user_id': '81b40fccba574ac2b058159809c549ca'}
   ```
   {/caption}
   
1. Запустите миграцию одной ВМ c ожиданием выполнения миграции:

   ```console
   # openstack server migrate --live-migration --wait fb010714-ead6-46f4-8dfb-ee27ce0970e5
   Complete
   ```

1. Проверьте, что ВМ успешно запустилась на другом узле после миграции:

   ```console
   # openstack server show fb010714-ead6-46f4-8dfb-ee27ce0970e5
   ```

   {caption(Пример ожидаемого результата)[align=left;position=above]}
   ```console
   +-------------------------------------+-----------------------------------------------------------+
   | Field                               | Value                                                     |
   +-------------------------------------+-----------------------------------------------------------+
   | OS-DCF:diskConfig                   | MANUAL                                                    |
   | OS-EXT-AZ:availability_zone         | AZ1                                                       |
   | OS-EXT-SRV-ATTR:host                | kcn002                                                    |
   | OS-EXT-SRV-ATTR:hypervisor_hostname | kcn002                                                    |
   | OS-EXT-SRV-ATTR:instance_name       | instance-00000008                                         |
   | OS-EXT-STS:power_state              | Running                                                   |
   | OS-EXT-STS:task_state               | None                                                      |
   | OS-EXT-STS:vm_state                 | active                                                    |
   | OS-SRV-USG:launched_at              | 2025-01-20T12:54:46.000000                                |
   | OS-SRV-USG:terminated_at            | None                                                      |
   | accessIPv4                          |                                                           |
   | accessIPv6                          |                                                           |
   | addresses                           | local-net=10.31.1.34, 192.168.100.4                       |
   | config_drive                        | True                                                      |
   | created                             | 2025-01-20T12:54:34Z                                      |
   | flavor                              | Basic-1-1 (dac0c7ba-a78f-4fb5-a96a-e537937e935a)          |
   | hostId                              | bb54c1c859458dd31ed9f1a7e44388f219352bc642594a151c04de15  |
   | id                                  | fb010714-ead6-46f4-8dfb-ee27ce0970e5                      |
   | image                               | N/A (booted from volume)                                  |
   | key_name                            | centos-Basic-1-1-10GB-3-1RxhxnVS                          |
   | name                                | centos_Basic-1-1_10GB_3                                   |
   | os_type                             | linux                                                     |
   | progress                            | 0                                                         |
   | project_id                          | 974ccf8970844b18a109b3bd828f4d12                          |
   | properties                          | service_user_id='c49c389fd5bc46b1bbfb288fb74c2a4c'        |
   | security_groups                     | id='03267fff-f325-48e8-b316-5613c407795c', name='iocmp'   |
   |                                     | id='139bc5aa-b415-427f-adc9-4b54b6c99c8b', name='default' |
   |                                     | id='685e2e9a-7ac5-4778-b9cf-1592178d5047', name='ssh'     |
   | status                              | ACTIVE                                                    |
   | updated                             | 2025-01-20T15:26:33Z                                      |
   | user_id                             | 8747232330a0480faf3289b580955daf                          |
   | volumes_attached                    | id='c8fc461d-6f8e-496b-a9b5-85dd444957c0'                 |
   +-------------------------------------+-----------------------------------------------------------+
   ```
   {/caption}

1. Запустите пакетную миграцию всех ВМ в статусе `ACTIVE` с узла (указывается в параметре `--host`):
   
   ```console
   for server in $(openstack server list -f value --all --long  --host kcn001 --status ACTIVE -c ID); do openstack server migrate --live-migration --wait ${server}; done
   Complete
   ```

1. Убедитесь, что на узле не осталось ВМ. В случае наличия ВМ в статусе `SHUTOFF` (отключены), продолжайте процедуру без их миграции:
 
   {note:warn}
   
   Если виртуальная машина находится в других статусах, определите причины и устраните их до перезагрузки.
   
   {/note}

   ```console
   # openstack server list -f value --all --long  --host kcn001
   ```
   
1. После того как все ВМ будут перенесены с узла, выполните его перезагрузку.

   Перед перезагрузкой проверьте версию ядра и что пакет с новым ядром установлен:

   ```console
   $ ssh kcn001
   $ uname -r
   $ sudo rpm -qa | grep kernel-lt-6.1.110-1.el7.3.x86_64
   $ sudo shutdown -r now
   ```
   
1. После запуска вычислительного узла убедитесь, что все сервисы успешно запущены и загружено новое ядро.

   Если есть интерфейс `dummy-i-evpn`, Unit Network запускается раньше и может быть запущен с ошибками.

   ```console
   $ ssh kcn001
   $ sudo systemctl list-units --failed
   $ uname -r
   $ 6.1.110-1.el7.3.x86_64
   ```

1. С управляющего узла `cpn003` проверьте, что на гипервизоре `kcn001` успешно запущены:

   1. Сервис Nova:

      ```console
      # openstack compute service list --host kcn001
      ```

      {caption(Пример ожидаемого результата)[align=left;position=above]}
      ```console
      +----+--------------+--------+------+----------+-------+----------------------------+
      | ID | Binary       | Host   | Zone | Status   | State | Updated At                 |
      +----+--------------+--------+------+----------+-------+----------------------------+
      | 86 | nova-compute | kcn001 | AZ1  | disabled | up    | 2025-01-21T07:29:01.000000 |
      +----+--------------+--------+------+----------+-------+----------------------------+
      ```
      {/caption}
   
   1. Сервис Neutron:

      ```console
      # openstack network agent list --host kcn001
      ```

      {caption(Пример ожидаемого результата)[align=left;position=above]}
      ```console
      +--------------------------------------+--------------------+--------+-------------------+-------+-------+---------------------------+
      | ID                                   | Agent Type         | Host   | Availability Zone | Alive | State | Binary                    |
      +--------------------------------------+--------------------+--------+-------------------+-------+-------+---------------------------+
      | 3bdb2568-edf8-4f8b-88d9-8238b2416a34 | Open vSwitch agent | kcn001 | None              | :-)   | UP    | neutron-openvswitch-agent |
      | 77721c28-2b79-45cc-b01d-aad7ea8207b1 | L3 agent           | kcn001 | nova              | :-)   | UP    | neutron-l3-agent          |
      | 7ad6a475-82b2-47e7-b500-52cb8c789b81 | Metadata agent     | kcn001 | None              | :-)   | UP    | neutron-metadata-agent    |
      +--------------------------------------+--------------------+--------+-------------------+-------+-------+---------------------------+
      ```
      {/caption}

1. Если ошибок нет, выведите вычислительный узел из режима обслуживания, чтобы ВМ могли на нем создаваться:

   ```console
   # openstack compute service set --enable kcn001 nova-compute
   ```

1. Мигрируйте любую ВМ на узел:

   ```console
   # openstack server migrate --live-migration --os-compute-api-version 2.30 --host kcn001 --wait a26789e5-f236-4147-9092-f7ec4da97417   
   ```

1. Убедитесь, что ВМ мигрировала:

   ```console
   # openstack server list -f value --all --long  --host kcn001
   a26789e5-f236-4147-9092-f7ec4da97417 centos_Basic-1-1_10GB_4 ACTIVE None 1 {'local-net': ['192.168.100.16', '10.31.1.48']} N/A (booted from volume) N/A (booted from volume) Basic-1-1 dac0c7ba-a78f-4fb5-a96a-e537937e935a AZ1 kcn001 {'service_user_id': '454e823d46dd4d3f9fbf2366ece9b20f'}
   ```
   
## {heading(Процедура перед перезагрузкой Ceph-узлов)[id=migration_ceph]}

1. Перед перезагрузкой узлов Ceph проверьте правило udev. При необходимости приведите `DISK_NAME_PREFIX` в соответствие с именованием дисков в системе (пример: `KERNEL=="sd[b-z]"`):

   ```console
   $ ssh <ИМЯ_УЗЛА_CEPH>
   $ cat /etc/udev/rules.d/65-disk-owner.rules
   KERNEL=="vd[b-z]*", OWNER="ceph"
   ```

1. Исправьте, если диски имеют другое название:

   ```console
   $ cat <<EOF | sudo tee /etc/udev/rules.d/65-disk-owner.rules
   KERNEL=="<ПРЕФИКС_ИМЕНИ_ДИСКА>[b-z]*", OWNER="ceph"
   EOF
   ```

1. Зайдите на произвольный узел Ceph и проверьте текущий статус кластера:

   ```console
   $ ssh <УЗЕЛ>
   ```
   Здесь `<УЗЕЛ>` — узел Ceph. Пример: `csn003`.

1. Если проблем в кластере нет, выполните команды:

   ```console
   $ ceph -s
   $ ceph health
   ```
   
1. Выставите флаги `noout` и `norebalance` для временного отключения ребалансировки:

   ```console
   $ sudo ceph osd set noout
   $ sudo ceph osd set norebalance
   ```   

1. Перезагрузите узел Ceph:

   ```console
   $ sudo reboot
   ```

   Во время перезагрузки узла обратите внимание на статус кластера, секции `health` и `service:osd`, а именно:

   1. Если в секции `health` значение `slow ops` поменялось на `osd`, качество сервиса может быть ухудшено.
   1. Если в секции `data:pg` появились следующие статусы `pg`: `down`, `laggy`, `wait`, `inconsistent`, `incomplete`, могут появиться проблемы при доступе к данным.
   1. После перезагрузки узла, подождите пока все `pg` примут состояние `active+clean`, прежде чем переходить к перезагрузке следующего узла.
   1. По окончанию в секции `warning` не должно быть информации, что OSD или MON находятся в статусе `down`.
   1. Проверьте информацию о выставленных флагах `noout`, `norebalance`:

      ```console
      $ ceph -s
      $ ceph -s -w
      ```

1. Перейдите на узел, который перезагрузился, и проверьте, что нет ошибок:

   ```console
   $ systemctl list-units --failed
   UNIT LOAD ACTIVE SUB DESCRIPTION
   0 loaded units listed.
   uname -r
   6.1.110-1.el7.3.x86_64
   ```

1. Проверьте следующий Ceph-узел.

1. После окончания перезагрузки всего кластера Ceph, верните флаги `noout` и `norebalance` в прежнее состояние:

   ```console
   $ sudo ceph osd unset noout
   $ sudo ceph osd unset norebalance
   ```

1. Проверьте статус `Health_OK`:

   ```console
   $ ceph -s
   ```

## {heading(Миграция объектов сетевого узла перед его перезагрузкой)[id=migration_network]}

{note:err}

Если в инсталляции {var(sys2)} используется программный роутер, выполните команды, которые приведены в этом разделе. Иначе — перейдите к разделу {linkto(#migration_network_highiops)[text=%text]}.

{/note}

Чтобы выполнить миграцию объектов (роутеры, ВМ, DBaaS, кластеры Kubernetes) с сетевого узла перед его перезагрузкой:

1. Получите список всех L3 агентов:

   ```console
   # openstack network agent list --agent-type l3
   ```

   {caption(Пример ожидаемого результата)[align=left;position=above]}
   ```console
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   | fbce1819-9e94-4550-b694-da14e00cf6f3 | L3 agent   | cpn001 | nova              | :-)   | UP    | neutron-l3-agent |
   | 7604e0c3-9ca9-484e-82a8-94930252f82e | L3 agent   | cpn002 | nova              | :-)   | UP    | neutron-l3-agent |
   | ed72b979-bc2d-490f-b059-60cd753346ef | L3 agent   | cpn003 | nova              | :-)   | UP    | neutron-l3-agent |
   | eb3577de-736a-42c5-adc5-f02b33429f07 | L3 agent   | kcn001 | nova              | :-)   | UP    | neutron-l3-agent |
   | 5a26f82b-967a-4b08-a1d1-e6c07d489127 | L3 agent   | kcn002 | nova              | :-)   | UP    | neutron-l3-agent |
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   ```
   {/caption}

1. Проверьте, что узлы, с которого и на который выполняется миграция, имеют режим `agent_mode=dvr_snat`:

   {note:err}

   Нельзя выполнять миграцию роутера на вычислительный узел с режимом `agent_mode=dvr`.

   {/note}

   ```console
   # openstack network agent show <SRC_L3_ID>
   # openstack network agent show <DST_L3_ID>
   ```
   Здесь:

   * `<SRC_L3_ID>` — идентификатор L3 агента, с которого выполняется миграция.
   * `<DST_L3_ID>` — идентификатор L3 агента, на который выполняется миграция.
   
   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack network agent show ed72b979-bc2d-490f-b059-60cd753346ef                                                                                                                                          
   +-------------------+-----------------------------------------------------------------------------------------------------------+     
   | Field             | Value                                                                                                     |    
   +-------------------+-----------------------------------------------------------------------------------------------------------+        
   | admin_state_up    | UP                                                                                                        |          
   | agent_type        | L3 agent                                                                                                  |  
   | alive             | :-)                                                                                                       | 
   | availability_zone | nova                                                                                                      |  
   | binary            | neutron-l3-agent                                                                                          |   
   | configuration     | {'agent_mode': 'dvr_snat', 'handle_internal_only_routers': True, 'external_network_bridge': '',           |
   |                   | 'gateway_external_network_id': '', 'interface_driver': 'neutron.agent.linux.interface.OVSInterfaceDriver',| 
   |                   | 'log_agent_heartbeats': False, 'routers': 1, 'ex_gw_ports': 1, 'interfaces': 1, 'floating_ips': 0}        |                                                                            
   | created_at        | 2024-07-26 16:01:42                                                                                       |
   | description       | None                                                                                                      | 
   | ha_state          | None                                                                                                      |
   | host              | cpn003                                                                                                    |
   | id                | ed72b979-bc2d-490f-b059-60cd753346ef                                                                      |
   | last_heartbeat_at | 2024-07-29 11:23:25                                                                                       |
   | name              | None                                                                                                      |
   | resources_synced  | None                                                                                                      |
   | started_at        | 2024-07-26 16:01:42                                                                                       |
   | topic             | l3_agent                                                                                                  |
   +-------------------+-----------------------------------------------------------------------------------------------------------+
   ```
   {/caption}

1. Получите список роутеров на L3 агенте, с которого выполняется миграция:

   ```console
   # openstack router list --agent <SRC_L3_ID>
   ```
   Здесь `<SRC_L3_ID>` — идентификатор L3 агента.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack router list --agent fbce1819-9e94-4550-b694-da14e00cf6f3
   +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
   | ID                                   | Name   | Status | State | Project                          | Distributed | HA    |
   +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
   | f0620d62-ab42-4ff7-bbec-5e5440446517 | router | ACTIVE | UP    | ec5bd160e5ea4d8fb7ed07a099118437 | True        | False |
   +--------------------------------------+--------+--------+-------+----------------------------------+-------------+-------+
   ```
   {/caption}

1. Выполните миграцию роутеров:

   {note:err}
   
   Миграция роутеров может вызвать кратковременное нарушение трафика, поскольку живая миграция роутеров не поддерживается. 
   
   Миграция заключается в удалении роутера из одного агента и добавлении на другой агент вручную.
   
   {/note}

   1. Проверьте, что роутер размещен на агенте, с которого будет выполняться миграция:

      ```console
      # openstack network agent list --router <ID_РОУТЕРА>
      ```
      {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
      ```console
      # openstack network  agent list --router f0620d62-ab42-4ff7-bbec-5e5440446517
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      | fbce1819-9e94-4550-b694-da14e00cf6f3 | L3 agent   | cpn001 | nova              | :-)   | UP    | neutron-l3-agent |
      +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
      ```
      {/caption}

   1. Удалите роутер с агента, на котором он расположен, и добавьте его на агент, выбранный ранее для миграции.

      {note:warn}

      Нагрузка на сервер, на котором размещен выбранный агент, возрастет. Убедитесь, что ресурсов сервера достаточно для размещения дополнительного роутера.

      {/note}

      ```console
      # openstack network agent remove router <SRC_L3_ID> <ID_РОУТЕРА> --l3
      # openstack network agent add router <DST_L3_ID> <ID_РОУТЕРА> --l3
      ```
      Здесь:

      * `<SRC_L3_ID>` — идентификатор L3 агента, с которого выполняется миграция.
      * `<DST_L3_ID>` — идентификатор L3 агента, на который выполняется миграция.
      * `<ID_РОУТЕРА>` — идентификатор роутера, который нужно перенести.

      {caption(Пример команд)[align=left;position=above]}
      ```console
      # openstack network agent remove router fbce1819-9e94-4550-b694-da14e00cf6f3 f0620d62-ab42-4ff7-bbec-5e5440446517 --l3
      # openstack network agent add router 7604e0c3-9ca9-484e-82a8-94930252f82e f0620d62-ab42-4ff7-bbec-5e5440446517 --l3
      ```
      {/caption}

1. Проверьте, что роутер запустился на агенте после миграции:

   ```console
   # openstack network agent list --router <ID_РОУТЕРА>
   ```
   
   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack network  agent list --router f0620d62-ab42-4ff7-bbec-5e5440446517
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   | ID                                   | Agent Type | Host   | Availability Zone | Alive | State | Binary           |
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   | 7604e0c3-9ca9-484e-82a8-94930252f82e | L3 agent   | cpn002 | nova              | :-)   | UP    | neutron-l3-agent |
   +--------------------------------------+------------+--------+-------------------+-------+-------+------------------+
   ```
   {/caption}

1. Проверьте доступность роутера с помощью команды `ping`.

   {note:warn}

   Примерное время задержки на миграцию роутера 10-15 секунд на не загруженной операционной системе.

   {/note}
   
1. Проверьте, что пространство имен (namespace) роутера есть на узле, на который он был перенесен:

   ```console
   $ sudo ip netns | grep <ID_РОУТЕРА>
   ```
   Здесь `<ID_РОУТЕРА>` — идентификатор перенесенного роутера.
   
   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # ip netns | grep f0620d62-ab42-4ff7-bbec-5e5440446517
   snat-f0620d62-ab42-4ff7-bbec-5e5440446517 (id: 123)
   qrouter-f0620d62-ab42-4ff7-bbec-5e5440446517 (id: 122)
   ```
   {/caption}

## {heading(Миграция дисков High-IOPS перед перезагрузкой узлов с cinder-volume High-IOPS)[id=migration_network_highiops]}

Чтобы сохранить работоспособность ВМ с типом дисков High-IOPS используйте один из способов:

1. Выполните миграцию диска на узел с типом диска High-IOPS. Подробнее — в разделе {linkto(#migration_network_highiops_volume)[text=%text]}.
1. Измените тип диска на тип storage (Ceph). Подробнее — в разделе {linkto(#migration_network_highiops_retype)[text=%text]}.

   {note:info}

   Изменить тип диска можно как с High-IOPS на Ceph, так и наоборот.

   {/note}

### {heading(Миграция дисков)[id=migration_network_highiops_volume]}

Чтобы выполнить миграцию диска на узел с High-IOPS:

1. Переведите в режим обслуживания, который будет перезагружен, чтобы на нем не создавались новые диски.

   {note:info}
   
   В примере будет использоваться бекенд с узлом `kcn001@high-iops`.
   
   {/note}
   
   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   $ cinder service-disable kcn001@high-iops cinder-volume --reason "Kernel update"
   
   +------------------+---------------+----------+-----------------+
   | Host             | Binary        | Status   | Disabled Reason |
   +------------------+---------------+----------+-----------------+
   | kcn001@high-iops | cinder-volume | disabled | Kernel update   |
   +------------------+---------------+----------+-----------------+
   ```
   {/caption}

1. Проверьте наличие и доступность бекенда, на который будут мигрировать диски.
1. Чтобы выполнить миграцию High-IOPS дисков, с управляющего узла выполните проверку доступа к узлу, на который будет выполнена миграция. 

   {note:warn}
   
   Если узел не доступен, перейдите ко второму способу (подробнее — в разделе {linkto(#migration_network_highiops_retype)[text=%text]}).
   
   {/note}

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # cinder get-pools
   +----------+----------------+
   | Property | Value          |
   +----------+----------------+
   | name     | ceph@ceph#ceph |
   +----------+----------------+
   +----------+----------------------+
   | Property | Value                |
   +----------+----------------------+
   | name     | manila@manila#manila |
   +----------+----------------------+
   +----------+----------------------------+
   | Property | Value                      |
   +----------+----------------------------+
   | name     | kcn002@high-iops#high-iops |
   +----------+----------------------------+
   +----------+----------------------------+
   | Property | Value                      |
   +----------+----------------------------+
   | name     | kcn001@high-iops#high-iops |
   +----------+----------------------------+
   ```
   {/caption}

1. Получите идентификаторы дисков, которые нужно перенести.

   {note:info}
   
   Поиск выполните по cinder-volume, который требуется вывести из обслуживания.
   
   {/note}

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   for i in $(openstack volume list -f value --all --long | grep high-iops | cut -d ' ' -f1);
   do
   openstack volume show $i| grep kcn001@high-iops >> /dev/null && echo Volume ID to migration: $i;
   done
   Volume ID to migration: 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5
   Volume ID to migration: 13df8754-53f4-433d-a769-c84ebdffc3f1
   Volume ID to migration: 1a670089-b127-4407-9765-74a07c97f807
   ```
   {/caption}

1. Выполните миграцию диска. 

   {note:info}

   Во время миграции виртуальная машина останется доступной.
   
   {/note}
   
   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   $ cinder migrate 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5 kcn002@high-iops#high-iops
   Request to migrate volume 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5 has been accepted.
   ```
   {/caption}

1. С управляющего узла проверьте статус миграции диска: значение параметра `migration_status` должно быть `migrating` или `success`.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack volume show 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | Field                          | Value                                                                                                                             |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | attachments                    | [{'id': '8e7d54f0-91b6-49e6-a0c1-0dec515be2a5', 'attachment_id': '565459cc-de8e-4081-8ac2-cc6802e07bee', 'volume_id':             |
   |                                | '8e7d54f0-91b6-49e6-a0c1-0dec515be2a5', 'server_id': 'afca00c9-5c95-4979-b5b9-d1152573c6a8', 'host_name': None, 'device':         |
   |                                | '/dev/vda', 'attached_at': '2025-01-28T09:54:58.000000'}]                                                                         |
   | availability_zone              | AZ1                                                                                                                               |
   | bootable                       | true                                                                                                                              |
   | consistencygroup_id            | None                                                                                                                              |
   | created_at                     | 2025-01-28T09:50:56.000000                                                                                                        |
   | description                    |                                                                                                                                   |
   | encrypted                      | False                                                                                                                             |
   | id                             | 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5                                                                                              |
   | migration_status               | migrating                                                                                                                         |
   | multiattach                    | False                                                                                                                             |
   | name                           |                                                                                                                                   |
   | os-vol-host-attr:host          | kcn001@high-iops#high-iops                                                                                                        |
   | os-vol-mig-status-attr:migstat | migrating                                                                                                                         |
   | os-vol-mig-status-attr:name_id | 8e932125-4b60-441a-863e-2da3a8c6bf2e                                                                                              |
   | os-vol-tenant-attr:tenant_id   | 803f2652c3864de2803a7dac5a3ef992                                                                                                  |
   | properties                     | attached_mode='rw', readonly='False'                                                                                              |
   | replication_status             | None                                                                                                                              |
   | size                           | 13                                                                                                                                |
   | snapshot_id                    | None                                                                                                                              |
   | source_volid                   | None                                                                                                                              |
   | status                         | in-use                                                                                                                            |
   | type                           | high-iops                                                                                                                         |
   | updated_at                     | 2025-01-28T11:00:08.000000                                                                                                        |
   | user_id                        | 97f4234e23054354aef43eb5852b791d                                                                                                  |
   | volume_image_metadata          | {'os_type': 'linux', 'os_require_quiesce': 'yes', 'hw_rng_model': 'virtio', 'hw_qemu_guest_agent': 'yes',                         |
   |                                | 'hw_vif_multiqueue_enabled': 'True', 'mcs_os_distro': 'centos', 'mcs_os_version': '8.4', 'mcs_name': 'CentOS 8.4', 'os_version':  |
   |                                | '8.4', 'os_admin_user': 'centos', 'os_distro': 'centos8.4', 'image_id': 'bc3fe46a-932a-4bcd-b53a-01abbb811951', 'image_name':     |
   |                                | 'centos-8.4', 'checksum': '3efc9247d6adadad5286307ff628490d', 'container_format': 'bare', 'disk_format': 'raw', 'min_disk': '2',  |
   |                                | 'min_ram': '0', 'size': '10737418240'}                                                                                            |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   ```
   {/caption}

1. Проверьте, что диск успешно мигрировал: статус диск `success` и параметр `os-vol-host-attr:host` изменился на `kcn002@high-iops#high-iops`.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack volume show 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | Field                          | Value                                                                                                                             |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | attachments                    | [{'id': '8e7d54f0-91b6-49e6-a0c1-0dec515be2a5', 'attachment_id': '58b675d6-2e74-4d9b-81bd-a1813c86a263', 'volume_id':             |
   |                                | '8e7d54f0-91b6-49e6-a0c1-0dec515be2a5', 'server_id': 'afca00c9-5c95-4979-b5b9-d1152573c6a8', 'host_name': None, 'device':         |
   |                                | '/dev/vda', 'attached_at': '2025-01-28T11:01:30.000000'}]                                                                         |
   | availability_zone              | AZ1                                                                                                                               |
   | bootable                       | true                                                                                                                              |
   | consistencygroup_id            | None                                                                                                                              |
   | created_at                     | 2025-01-28T09:50:56.000000                                                                                                        |
   | description                    |                                                                                                                                   |
   | encrypted                      | False                                                                                                                             |
   | id                             | 8e7d54f0-91b6-49e6-a0c1-0dec515be2a5                                                                                              |
   | migration_status               | success                                                                                                                           |
   | multiattach                    | False                                                                                                                             |
   | name                           |                                                                                                                                   |
   | os-vol-host-attr:host          | kcn002@high-iops#high-iops                                                                                                        |
   | os-vol-mig-status-attr:migstat | success                                                                                                                           |
   | os-vol-mig-status-attr:name_id | 66b65275-6e28-4033-a17a-0aa9cb620c91                                                                                              |
   | os-vol-tenant-attr:tenant_id   | 803f2652c3864de2803a7dac5a3ef992                                                                                                  |
   | properties                     | attached_mode='rw', readonly='False'                                                                                              |
   | replication_status             | None                                                                                                                              |
   | size                           | 13                                                                                                                                |
   | snapshot_id                    | None                                                                                                                              |
   | source_volid                   | None                                                                                                                              |
   | status                         | in-use                                                                                                                            |
   | type                           | high-iops                                                                                                                         |
   | updated_at                     | 2025-01-28T11:01:30.000000                                                                                                        |
   | user_id                        | 97f4234e23054354aef43eb5852b791d                                                                                                  |
   | volume_image_metadata          | {'os_type': 'linux', 'os_require_quiesce': 'yes', 'hw_rng_model': 'virtio', 'hw_qemu_guest_agent': 'yes',                         |
   |                                | 'hw_vif_multiqueue_enabled': 'True', 'mcs_os_distro': 'centos', 'mcs_os_version': '8.4', 'mcs_name': 'CentOS 8.4', 'os_version':  |
   |                                | '8.4', 'os_admin_user': 'centos', 'os_distro': 'centos8.4', 'image_id': 'bc3fe46a-932a-4bcd-b53a-01abbb811951', 'image_name':     |
   |                                | 'centos-8.4', 'checksum': '3efc9247d6adadad5286307ff628490d', 'container_format': 'bare', 'disk_format': 'raw', 'min_disk': '2',  |
   |                                | 'min_ram': '0', 'size': '10737418240'}                                                                                            |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   ```
   {/caption}

1. Повторите действия для миграции оставшихся дисков.
1. После миграции всех дисков, проверьте, что на узле их нет:

   {note:info}

   Одним из вариантов проверки, кроме OpenStack CLI, будет проверка наличия LVM-дисков на мигрируемом узле с помощью команды `lvs`. 

   Они имеют вид `volume-2d1071cc-9b92-4673-9d38-7a72afff67fc` в Volume Group `kvm-vg`.

   {/note}

1. После переноса дисков перезагрузите узел.
1. После перезагрузки узла повторно включите сервис в эксплуатацию.

   {caption(Пример команды)[align=left;position=above]}
   ```console
   $ cinder service-enable kcn001@high-iops cinder-volume
   ```
   {/caption}

### {heading(Изменение типа диска)[id=migration_network_highiops_retype]}

Чтобы изменить тип диска с High-IOPS на Ceph:

1. Выполните смену типа диска, обязательно указав в команде параметр `--migration-policy on-demand` и зону доступности, куда будет перемещен диск (backend ceph).

   {caption(Пример команды)[align=left;position=above]}
   ```console
   $ cinder retype --migration-policy on-demand --availability-zone AZ1 1a670089-b127-4407-9765-74a07c97f807 ceph
   ```
   {/caption}

1. С управляющего узла проверьте статус миграции диска: значение параметра `migration_status` должно быть `migrating` или `success`.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack volume show 1a670089-b127-4407-9765-74a07c97f807                                                                                      
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | Field                          | Value                                                                                                                             |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | attachments                    | [{'id': '1a670089-b127-4407-9765-74a07c97f807', 'attachment_id': '1fd9bb7f-5352-4dbf-9f79-4b6d3d11e363', 'volume_id':             |
   |                                | '1a670089-b127-4407-9765-74a07c97f807', 'server_id': '48b6c029-ffd8-4533-9c69-11593b57005b', 'host_name': None, 'device':         |
   |                                | '/dev/vda', 'attached_at': '2025-01-28T08:49:42.000000'}]                                                                         |
   | availability_zone              | AZ1                                                                                                                               |
   | bootable                       | true                                                                                                                              |
   | consistencygroup_id            | None                                                                                                                              |
   | created_at                     | 2025-01-28T08:45:30.000000                                                                                                        |
   | description                    |                                                                                                                                   |
   | encrypted                      | False                                                                                                                             |
   | id                             | 1a670089-b127-4407-9765-74a07c97f807                                                                                              |
   | migration_status               | migrating                                                                                                                         |
   | multiattach                    | False                                                                                                                             |
   | name                           |                                                                                                                                   |
   | os-vol-host-attr:host          | kcn001@high-iops#high-iops                                                                                                        |
   | os-vol-mig-status-attr:migstat | migrating                                                                                                                         |
   | os-vol-mig-status-attr:name_id | 0eda849b-3e7b-4473-9060-10c1f0e60312                                                                                              |
   | os-vol-tenant-attr:tenant_id   | 803f2652c3864de2803a7dac5a3ef992                                                                                                  |
   | properties                     | attached_mode='rw', readonly='False'                                                                                              |
   | replication_status             | None                                                                                                                              |
   | size                           | 12                                                                                                                                |
   | snapshot_id                    | None                                                                                                                              |
   | source_volid                   | None                                                                                                                              |
   | status                         | retyping                                                                                                                          |
   | type                           | high-iops                                                                                                                         |
   | updated_at                     | 2025-01-28T12:00:22.000000                                                                                                        |
   | user_id                        | 97f4234e23054354aef43eb5852b791d                                                                                                  |
   | volume_image_metadata          | {'os_type': 'linux', 'os_require_quiesce': 'yes', 'hw_rng_model': 'virtio', 'hw_qemu_guest_agent': 'yes',                         |
   |                                | 'hw_vif_multiqueue_enabled': 'True', 'mcs_os_distro': 'centos', 'mcs_os_version': '8.4', 'mcs_name': 'CentOS 8.4', 'os_version':  |
   |                                | '8.4', 'os_admin_user': 'centos', 'os_distro': 'centos8.4', 'image_id': 'bc3fe46a-932a-4bcd-b53a-01abbb811951', 'image_name':     |
   |                                | 'centos-8.4', 'checksum': '3efc9247d6adadad5286307ff628490d', 'container_format': 'bare', 'disk_format': 'raw', 'min_disk': '2',  |
   |                                | 'min_ram': '0', 'size': '10737418240'}                                                                                            |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   ```
   {/caption}

1. Проверьте, что диск успешно мигрировал: статус диск `success` и параметр `os-vol-host-attr:host` изменился на `kcn002@high-iops#high-iops`.

   {caption(Пример команды и ожидаемого результата)[align=left;position=above]}
   ```console
   # openstack volume show 1a670089-b127-4407-9765-74a07c97f807
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | Field                          | Value                                                                                                                             |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   | attachments                    | [{'id': '1a670089-b127-4407-9765-74a07c97f807', 'attachment_id': 'd5681508-8f4e-45f8-992f-608b4f91e019', 'volume_id':             |
   |                                | '1a670089-b127-4407-9765-74a07c97f807', 'server_id': '48b6c029-ffd8-4533-9c69-11593b57005b', 'host_name': None, 'device':         |
   |                                | '/dev/vda', 'attached_at': '2025-01-28T12:01:53.000000'}]                                                                         |
   | availability_zone              | AZ1                                                                                                                               |
   | bootable                       | true                                                                                                                              |
   | consistencygroup_id            | None                                                                                                                              |
   | created_at                     | 2025-01-28T08:45:30.000000                                                                                                        |
   | description                    |                                                                                                                                   |
   | encrypted                      | False                                                                                                                             |
   | id                             | 1a670089-b127-4407-9765-74a07c97f807                                                                                              |
   | migration_status               | success                                                                                                                           |
   | multiattach                    | False                                                                                                                             |
   | name                           |                                                                                                                                   |
   | os-vol-host-attr:host          | rbd:volumes:c1@ceph#ceph                                                                                                          |
   | os-vol-mig-status-attr:migstat | success                                                                                                                           |
   | os-vol-mig-status-attr:name_id | 56b4f50d-9e8f-4047-b4f2-b4f527198bd9                                                                                              |
   | os-vol-tenant-attr:tenant_id   | 803f2652c3864de2803a7dac5a3ef992                                                                                                  |
   | properties                     | attached_mode='rw', readonly='False'                                                                                              |
   | replication_status             | None                                                                                                                              |
   | size                           | 12                                                                                                                                |
   | snapshot_id                    | None                                                                                                                              |
   | source_volid                   | None                                                                                                                              |
   | status                         | in-use                                                                                                                            |
   | type                           | ceph                                                                                                                              |
   | updated_at                     | 2025-01-28T12:01:53.000000                                                                                                        |
   | user_id                        | 97f4234e23054354aef43eb5852b791d                                                                                                  |
   | volume_image_metadata          | {'os_type': 'linux', 'os_require_quiesce': 'yes', 'hw_rng_model': 'virtio', 'hw_qemu_guest_agent': 'yes',                         |
   |                                | 'hw_vif_multiqueue_enabled': 'True', 'mcs_os_distro': 'centos', 'mcs_os_version': '8.4', 'mcs_name': 'CentOS 8.4', 'os_version':  |
   |                                | '8.4', 'os_admin_user': 'centos', 'os_distro': 'centos8.4', 'image_id': 'bc3fe46a-932a-4bcd-b53a-01abbb811951', 'image_name':     |
   |                                | 'centos-8.4', 'checksum': '3efc9247d6adadad5286307ff628490d', 'container_format': 'bare', 'disk_format': 'raw', 'min_disk': '2',  |
   |                                | 'min_ram': '0', 'size': '10737418240'}                                                                                            |
   +--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------+
   ```
   {/caption}

1. Повторите действия для миграции оставшихся дисков.
1. После миграции всех дисков, проверьте, что на узле их нет:

   {note:info}
   
   Одним из вариантов проверки, кроме OpenStack CLI, будет проверка наличия LVM-дисков на мигрируемом узле с помощью команды `lvs`. 

   Они имеют вид `volume-2d1071cc-9b92-4673-9d38-7a72afff67fc` в Volume Group `kvm-vg`.
   
   {/note}

1. После переноса дисков перезагрузите узел.
1. После перезагрузки узла повторно включите сервис в эксплуатацию.

   {caption(Пример команды)[align=left;position=above]}
   ```console
   $ cinder service-enable kcn001@high-iops cinder-volume
   ```
   {/caption}

## {heading(Перезагрузка узлов)[id=migration_network_restart]}

1. Последовательно перезагрузите узлы (включая деплой-ноду), кроме вычислительных узлов с High-IOPS дисками (узлы из группы `vkcloud_scst_iscsi`): 

   {note:info}

   Перезагрузите вычислительные узлы с High-IOPS дисками после обновления Cinder.

   {/note}

   1. Перед перезагрузкой управляющего узла поменяйте политики `imagePullPolicy` у деплоймента `mcs-admin-ui-app` на `IfNotPresent`:

      ```console
      # kubectl -n mcs-front-vkcloud edit deploy mcs-admin-ui-app
      ...
      #imagePullPolicy: Always
      imagePullPolicy: IfNotPresent
      ...
      ```

      Это позволит автоматически перезапустить все поды Kubernetes-кластера без лишних действий вручную.

   1. Зайдите на обновленный узел и перезагрузите его:

      ```console
      $ ssh <ИМЯ_УЗЛА>
      $ sudo shutdown -r now
      ```

      Здесь `<ИМЯ_УЗЛА>` — имя обновленного узла из файла `inventory.yaml`, созданного на предыдущих шагах.

   1. Убедитесь, что операционная система загрузилась без ошибок:

      ```console
      $ systemctl status | head -n 5
      ● <Server_name>
          State: running
           Jobs: 0 queued
         Failed: 0 units
          Since: <date>; 16min ago
      $ systemctl list-units --failed
        UNIT LOAD ACTIVE SUB DESCRIPTION
      0 loaded units listed.
      $ uname -r
      6.1.110-1.el7.3.x86_64
      ```

   1. Убедитесь, что все сервисы загрузились и в работе {var(sys2)} нет ошибок.

   1. Перезагрузите следующий узел через 15 минут после успешной перезагрузки предыдущего.

      Перед перезагрузкой LM-узла убедитесь, что systemd unit Logstash сконфигурирован верно:

      ```console
      $ grep 'TimeoutStopSec' /etc/systemd/system/logstash.service
      ```

      {caption(Пример ответа)}
      ```console
      TimeoutStopSec=300s
      ```
      {/caption}

      Если значение параметра `TimeoutStopSec` меньше 300 с:
   
         1. Измените его на `300s` в файле:

            ```console
            /etc/systemd/system/logstash.service
            ```
            
         1. Выполните команду:

            ```console
            $ sudo systemctl daemon-reload 
            ```

1. После перезагрузки управляющих узлов проверьте, что все поды в Kubernetes запущены:

   ```console
   $ sudo kubectl get pods -A | grep -v -e Running -e Compl
   ```

1. Убедитесь, что кластер PostgreSQL успешно запущен:

   1. Получите список кластеров PostgreSQL:

      ```console
      $ sudo bash
      # ls /srv/stolon/
      bin                      postgres-magnum-addons-f3  postgres-projectsservice-f3  postgres-syncservice-f3
      postgres-billingcore-f3  postgres-magnum-rapid-f3   postgres-servicesmanager-f3  postgres-xaas-f3
      ```
      
   1. В любом из кластеров найдите файл `stolonctl`:
   
      ```console
      # ls /srv/stolon/postgres-magnum-addons-f3/bin/stolonctl
      /srv/stolon/postgres-magnum-addons-f3/bin/stolonctl
      ```     

   1. Получите полное название кластера из директории:

      ```console
      # ls /etc/stolon/
      billingcore-stolon-cluster    magnum-rapid-stolon-cluster     servicesmanager-stolon-cluster  xaas-stolon-cluster
      magnum-addons-stolon-cluster  projectsservice-stolon-cluster  syncservice-stolon-cluster
      ```

   1. Подставьте полученное название кластера в команду `stolonctl`:
   
      ```console
      # /srv/stolon/postgres-magnum-addons-f3/bin/stolonctl status --cluster-name magnum-addons-stolon-cluster --store-backend consul --store-endpoints http://127.0.0.1:8500
      ```

   1. Если в выводе команды параметр `HEALTHY` имеет значение `False`, выполните следующие команды на всех управляющих узлах:

      ```console
      $ sudo systemctl start stolon-keeper-postgres-billingcore-* stolon-keeper-postgres-projectsservice-* stolon-keeper-postgres-xaas-* stolon-keeper-postgres-magnum-addons-* stolon-keeper-postgres-servicesmanager-* stolon-keeper-postgres-magnum-rapid-* stolon-keeper-postgres-syncservice-*
      ```

      Через 5 минут кластеры PostgreSQL должны синхронизироваться, а зависимые от них поды запуститься без ошибок.
