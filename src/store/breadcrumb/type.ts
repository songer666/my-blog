/**
 * 面包削类型
 * @title 面包削标题
 * @url 面包削链接
 * @disabled 是否禁用
 * */
export type Crumb = {
    title: string;
    url?: string;
}

/**
 * 面包削动作
 * @setCrumbs 设置面包削
 * @pushCrumb 添加面包削
 * @popCrumb 删除面包削
 * @replaceCrumb 替换面包削
 * @clearCrumb 清空面包削
 * */
export type CrumbAction = {
    setCrumbs: (crumbs: Crumb[]) => void;
    clearCrumb: () => void;
}

/**
 * 面包削整体类型
 * */
export type CrumbState = {
    crumbs: Crumb[],
} & CrumbAction

/**
 * zustand中间件类型
 * */
export type Middlewares =
    [
        ['zustand/subscribeWithSelector', never],
        ['zustand/immer', never],
        ['zustand/devtools', never],
    ];




