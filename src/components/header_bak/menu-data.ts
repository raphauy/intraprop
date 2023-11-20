export interface MenuType {
    key: string
    href: string
    description?: string
    subMenu?: MenuType[]    
}

export const publicMenu: MenuType[]= [
        {
            key: 'home',
            href: '/',
        },
        { 
            key: 'services',
            href: '/services',
            subMenu: [
                {
                    key: 'service1',
                    href: '/service1',
                    description: 'Service 1 description'
                },
                {
                    key: 'service2',
                    href: '/service2',
                    description: 'Service 2 description'
                },
                {
                    key: 'service3',
                    href: '/service3',
                    description: 'Service 3 description'
                },
            ]
        },
        {
            key: 'about',
            href: '/about',
        },
        {
            key: 'contact',
            href: '/contact',
        },
        ]
