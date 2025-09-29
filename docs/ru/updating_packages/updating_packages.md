# {heading(Обновление пакетов)[id=updating_packages]}

## {heading(Распаковка и настройка автоматики обновления)[id=settings_update]}

1. Распакуйте входящий в состав дистрибутива архив `repos_mcs_distr_box-${NEW_RELEASE_NAME}.tar.gz`:

   ```console
   $ cd $NEW_DISTRIB_DIR
   $ tar xvf repos_mcs_distr_box-${NEW_RELEASE_NAME}.tar.gz
   ```

1. Перейдите в директорию `repos_mcs_distr_box-${NEW_RELEASE_NAME}/upgrade/os/ansible/`:

   ```console
   $ cd repos_mcs_distr_box-${NEW_RELEASE_NAME}/upgrade/os/ansible/
   ```

1. Сформируйте два Inventory-файла:

   1. Файл с перечнем узлов, требующих обновления пакетов.

      {caption(Пример содержимого файла inventory-all.yaml)[align=left;position=above]}
      ```yaml
      ---
      all:
        hosts:
          deploy:
            ansible_connection: local
          cpn001: {}
          cpn002: {}
          cpn003: {}
          kcn001: {}
          kcn00X: {}
          csn001: {}
          csn00X: {}
          lm001: {}
      ```
      {/caption}

   1. Файл для деплой-ноды.

      {caption(Содержимое файла inventory-deploy.yaml)[align=left;position=above]}
      ```yaml
      ---
      all:
        hosts:
          deploy:
            ansible_connection: local
      ```
      {/caption}
   
1. Проверьте список узлов, на которых произойдет обновление:

   ```console
   $ ansible-playbook -i inventory-all.yaml -f 20 -e @list-redos-repos.yaml ./update_repos.yml --list-hosts
      ```

1. Обновите репозитории:

   ```console
   $ ansible-playbook -i inventory-all.yaml -f 20 -e nexus_host='deploy001.local:8081' -e @list-redos-repos.yaml ./update_repos.yml
   ```

   Здесь `deploy001.local:8081` — значение переменной `deploy_node_fqdn` из файла `minimal.yml`.

   После отработки команды на всех узлах будут подключены все YUM-репозитории {var(sys2)} версии {var(version_new)}.

## {heading(Проверка совместимости новой версии ядра)[id=new_kernel_version_check]}

Проверьте, что новое ядро 6.1.110-1.el7.3 совместимо с используемыми узлами:

1. Выберите один узел (кроме гипервизора с High-IOPS дисками).
1. Если требуется, переведите его в режим обслуживания согласно разделам документа **Руководство администратора {var(system)}**:

   * **Администрирование** → **Управление инфраструктурой** → **Управление вычислительными узлами (гипервизорами)**.
   * **Администрирование** → **Управление инфраструктурой** → **Операции с управляющими узлами**.

1. Установите новую версию ядра:

   ```console
   $ sudo yum update kernel
   ```

1. Загрузите ОС с новым ядром.

Если тестовое обновление ядра прошло успешно, переходите к следующим шагам. На остальных узлах ядро будет обновлено на шагах, описанных в разделе {linkto(#system_packages_update)[text=%text]}.

Если на {var(sys3)} используются серверы разных производителей или серверы, сильно отличающиеся по конфигурации, выполните такую проверку на каждом типе серверов, используемых на {var(sys3)}.

{caption(Пример команды проверки текущей версии ядра)[align=left;position=above]}
```console
$ uname -r
6.1.110-1.el7.3.x86_64
```
{/caption}

## {heading(Обновление системных пакетов)[id=system_packages_update]}

### {heading(Описание)[id=update_description]}

Обновление содержит следующие файлы:

* `list-packages-auto-cve.yaml` — список пакетов с CVE уязвимостями.
* `list-packages-kernels.yaml` — список пакетов с обновлениями ядра.
* `list-packages-need-to-be-updated-in-product.yaml` — список пакетов, которые обновляются в {var(sys3)}. Используются только для деплой-ноды.
* `list-packages-pre-update.yaml` — список пакетов, которые обновляются до установки {var(sys2)}.
* `update_os.yaml` — Ansible-плейбук, который:

   * Последовательно переходит на каждый узел из Inventory-файла.
   * Получает список установленных пакетов.
   * Обновляет установленные пакеты, которые есть в списках на обновление.
  
* `list-redos-repos.yaml` — список репозиториев для обновления.
* `update_repos.yml` — Ansible-плейбук, который настраивает необходимые репозитории на целевых узлах.

### {heading(Обновление)[id=update]}

Запустите плейбуки обновления пакетов:

   ```console
   $ ansible-playbook -i inventory-all.yaml \
     -f 20 \
     -e env=vkcloud \
     -e ansible_python_interpreter=/usr/bin/python3 \
     -e @list-packages-auto-cve.yaml \
     -e @list-packages-pre-update.yaml \
     -e @list-packages-kernels.yaml \
     update_os.yaml
   ```

   ```console
   $ ansible-playbook -i inventory-deploy.yaml \
     -f 20 \
     -e env=vkcloud \
     -e ansible_python_interpreter=/usr/bin/python3 \
     -e @list-packages-need-to-be-updated-in-product.yaml \
     -e @list-packages-pre-update.yaml \
     -e @list-packages-kernels.yaml \
     update_os.yaml
   ```

В связи с регулярным обновлением CVE, версия в дистрибутиве может быть новее указанной в файле. Посмотрите актуальную версию в дистрибутиве и укажите ее в файле `list-packages-auto-cve.yaml`.

### {heading(Устранение неполадок)[id=update_possible_problems]}

**Проблема**: При выполнении команд обновления произошла ошибка:

   ```console
   TASK [Update packages with CVE] ****************************************************************************
   ...
   failed: [deploy] (item={'name': 'glib2', 'version': '0:2.65.3-5.el7'}) => {"ansible_loop_var": "item", "changed": false, "failures": ["No package glib2-0:2.65.3-5.el7* available."], "item": {"name": "glib2", "version": "0:2.65.3-5.el7"}
   ...
   ```

**Причина:** Ошибка связана с недавним запуском Nexus и загрузкой RPM-структуры.

**Решение**: Повторите выполнение команд обновления через 1-2 минуты.
