import { tableOfContents as toc1 } from './update-guide.toc.js';

export const config = {
    docsFullPath: null, // Абсолютный путь до папки с исходниками документации, если null, то ./docs
    resultFullPath: '/d11n-data/result', // Абсолютный путь до папки с временными файлами, если null, то ./tmp
    documents: [
        {
            buildPoints: ['common'], // Для каких окружений собрать документ
            description: 'Руководство по обновлению', // Заголовок документа
            key: 'update-guide', // Ключ, участвует в формировании имени документа
            htmlTemplate: null, // Какой шаблон для html использовать, не обязательное поле
            fodtTemplate: 'fodt-template', // Какой шаблон для odt использовать
            fodtParams: {
                system: 'Private Cloud',
                doctitle: 'Руководство по обновлению',
                revnumber1: 'Версия 4.1',
                revdate1: ' от 05.06.2024',
            },
            tableOfContents: toc1, // Содержание
        }
    ]
};
