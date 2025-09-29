export const config = {
    main: {
        projectName: 'Private Cloud',
        copyright: '© %year% Private Cloud',
        analytics: null,
        scriptManager: 'https://vkcs-scripts.mrgcdn.ru/master/help.js',
        locales: ['ru'],
    },
    breadcrumbs: {
        projectName: 'Private Cloud',
    },
    leftMenu: {
            startLevel: 2,
        },
    contacts: {
        useNativeSupportUrl: false,
        url: 'https://support.mcs.mail.ru/login/oauth2/authorization/vkcloud',
    },
    paths: {
        policy: '/additionals/start/legal/policy-privacy',
    },
    enablers: {
        auth: false,
        likeDislike: false,
        sentry: false,
        editOnGitOps: false,
        telegramSupport: false,
    },
    translations: {
        en: {
            'LeftNavMenu.backLink.title': 'Go to main page',
        },
        ru: {
            'LeftNavMenu.backLink.title': 'На главную',
        },
    },
};
