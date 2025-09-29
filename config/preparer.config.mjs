import {
    AssetFileNamesChecker,
    FolderStructureChecker,
    LinksChecker,
    // UuidSnapshotIntegrityChecker,
    LinksWithHashChecker,
    MetaFilesChecker,
    MetaParamIntroChecker,
    // ExternalFolderChecker,
    MetaParamRelativeSectionsChecker,
    MetaParamUuidChecker,
    PreprocIncludeChecker,
    PreprocVariablesChecker,
} from '@vk-tech/d11n-preparer/checkers';
import {
    ArticleDatesPreparer,
    DocsConfigForNextPreparer,
    LaunchPreparer,
    LinksPreparer,
    LinktoCachePreparer,
    MetaParamUuidPreparer,
    OriginalTreeCachePreparer,
    // RedirectSnapshotPreparer,
    PublicAssetsPreparer,
    SearchIndexPreparer,
    // UuidSnapshotPreparer,
} from '@vk-tech/d11n-preparer/preparers';

export const config = {
    docsRelativePath: null, // Путь до папки с исходниками документации, если null, то ./docs
    dataRelativePath: null, // Путь до папки с результатами подготовки файлами, если null, то ./.data
    publicAssetsRelativePath: null, // Путь до папки со 'статикой', если null, то ./public/_docs
    commands: {
        // Подготовка документации к запуску портала
        // npx preparer start prepare
        prepare: [
            LaunchPreparer, // Создаем конфиг файл с partitions
            FolderStructureChecker, // Проверяем иерархию файлов и папок документации
            MetaFilesChecker, // Проверяем .meta.json файлы на соответствие схемам
            DocsConfigForNextPreparer, // Создаём .json версию конфига docs.config.js для next.js
            MetaParamUuidPreparer, // Заполняем meta-параметр uuid для новых статей
            MetaParamUuidChecker, // Проверяем meta-параметр uuid
            OriginalTreeCachePreparer, // Создаём кэш оригинального дерева
            // UuidSnapshotIntegrityChecker, // Проверяем целостность коллекции uuid из .meta.json файлов
            // UuidSnapshotPreparer, // Создаём snapshot всех uuid (для checker:UuidSnapshotIntegrityChecker)
            // RedirectSnapshotPreparer, // Создаём snapshot для проверки редиректов (test:RedirectChecker)
            MetaParamRelativeSectionsChecker, // Проверяем meta-параметр relativeSections, корректность ссылок
            MetaParamIntroChecker, // Проверяем meta-параметр intro, корректность ссылок
            PreprocIncludeChecker, // Проверяем корректность использования {include(path)} в .md файлах
            PreprocVariablesChecker, // Проверяем корректность использования {var(foo)} в .md файлах
            AssetFileNamesChecker, // Проверяем корректность имён файлов в папках assets
            PublicAssetsPreparer, // Переносим статичные файлы из папок "assets" в публичную директорию
            LinktoCachePreparer, // Подготавливаем кэш для linkTo препроцессора
            SearchIndexPreparer, // Создаём индекс для поиска
            ArticleDatesPreparer, // Актуализируем даты (создание/изменение) у статей
            // ExternalFolderChecker, // Проверяем схему и корректность ссылок для файлов в папке external/sections
            LinksPreparer, // Подготовка служебных файлов для test:LinksChecker
            // Отключил. Причина — в РУ конструкция внутри код-блока, как ссылка https://gitlab.corp.mail.ru/infra/private/documents/private-cloud-docs/install-guide/-/blob/master/docs/ru/appendix_manual_installer_launching/appendix_manual_installer_launching.md?ref_type=heads&plain=1#L428
            // LinksChecker, // Подготовка служебных файлов для test:LinksChecker
        ],
        // Проверка портала после запуска
        // npx preparer start checkup
        checkup: [
            LinksWithHashChecker, // Проверка ссылок с хешем на портале
        ],
    },
};
