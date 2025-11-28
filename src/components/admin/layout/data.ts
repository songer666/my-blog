const baseUrl = "/admin/dashboard"

/**
 * 管理端数据和标题
 * */
export let data = {
    user: {
        name: "",
        email: '',
        url: `${baseUrl}/profile`,
        avatar: "/avatar/avatar.jpg",
    },
    header: {
        name: "气质猫个人博客",
        logo: "GalleryVerticalEnd",
        email: '',
    },
    navMain: [
        {
            title: "主页",
            url: baseUrl,
            icon: "LayoutDashboard",
            isActive: true,
        },
        {
            title: "用户管理",
            url: `${baseUrl}/user`,
            icon: "User2",
        },
        {
            title: "留言管理",
            url: `${baseUrl}/message`,
            icon: "MessageSquare",
        },
        {
            title: "博客管理",
            url: '',
            icon: "BookOpen",
            items: [
                {
                    title: "博客数据页",
                    url: `${baseUrl}/blog`,
                },
                {
                    title: "创建博客页",
                    url: `${baseUrl}/blog/create`,
                },
                {
                    title: "标签管理页",
                    url: `${baseUrl}/blog/tag`,
                },
            ],
        },
        {
            title: "资源管理",
            url: `${baseUrl}/resources`,
            icon: "Folder",
            items: [
                {
                    title: "代码资源",
                    url: `${baseUrl}/resources/code`,
                },
                {
                    title: "图片资源",
                    url: `${baseUrl}/resources/image`,
                },
                {
                    title: "音乐资源",
                    url: `${baseUrl}/resources/music`,
                },
                {
                    title: "视频资源",
                    url: `${baseUrl}/resources/video`,
                },
            ],
        },
    ],
    projects: [
        {
            title: "Design Engineering",
            url: "#",
            icon: "Frame",
        },
        {
            title: "Sales & Marketing",
            url: "#",
            icon: "PieChart",
        },
        {
            title: "Travel",
            url: "#",
            icon: "Map",
        },
    ],
}