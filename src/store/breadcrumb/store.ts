import {createStore} from "@/lib/store";
import {StateCreator, useStore} from "zustand";
import {Crumb, CrumbState, Middlewares} from "@/store/breadcrumb/type";
import {useShallow} from "zustand/react/shallow";

const initCrumbs: Crumb[] = [];
/**
 * 初始化状态
 * 使用中间价createStore创建的入参creator
 * */
const crumbCreator: StateCreator<CrumbState, Middlewares> = (set) => ({
    crumbs: initCrumbs,

    setCrumbs: (list) =>
        set(d => { d.crumbs = list }, false, 'breadcrumb/set'),
    clearCrumb: () =>
        set(d => { d.crumbs = [] }, false, 'breadcrumb/clear'),
});

/**
 * 状态池创建函数
 */
export const breadcrumbStore =
    createStore<CrumbState>(crumbCreator, { name: 'bread-crumb-store' });

/**
 * 创建store的钩子函数
 * @selector为整个zustand方法构造器
 * */
export function useBreadCrumbStore<T>(selector: (state: CrumbState) => T): T {
    return useStore(breadcrumbStore, useShallow<CrumbState, T>(selector));
}


