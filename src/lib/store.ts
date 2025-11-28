import type { StateCreator } from 'zustand';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

import { createStore as createStoreFunction } from 'zustand';
import { devtools, persist, redux, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * 创建包含订阅，immer以及devtoools功能的普通状态商店
 * @param creator
 * @param devtoolsOptions
 */
export const createStore = <T extends object>(
    creator: StateCreator<
        T,
        [
            ['zustand/subscribeWithSelector', never],
            ['zustand/immer', never],
            ['zustand/devtools', never],
        ]
    >,
    devtoolsOptions?: DevtoolsOptions,
) => {
    return createStoreFunction<T>()(
        subscribeWithSelector(immer(devtools(creator, devtoolsOptions))),
    );
};

/**
 * 创建包含订阅，immer以及devtoools功能的普通状态商店
 * 同时支持自动存储到客户端，默认存储到localstorage
 * @param creator
 * @param persistOptions
 * @param devtoolsOptions
 */
export const createPersistStore = <T extends object, P = T>(
    creator: StateCreator<
        T,
        [
            ['zustand/subscribeWithSelector', never],
            ['zustand/immer', never],
            ['zustand/devtools', never],
            ['zustand/persist', P],
        ]
    >,
    persistOptions: PersistOptions<T, P>,
    devtoolsOptions?: DevtoolsOptions,
) => {
    return createStoreFunction<T>()(
        subscribeWithSelector(
            immer(devtools(persist(creator as unknown as any, persistOptions), devtoolsOptions)),
        ),
    );
};

/**
 * 创建包含订阅，immer以及devtoools功能的reducer状态商店
 * 同时支持自动存储到客户端，默认存储到localstorage
 * @param reducer
 * @param initialState
 * @param devtoolsOptions
 */
export const createReduxStore = <
    T extends object,
    A extends {
        type: string;
    },
>(
    reducer: (state: T, action: A) => T,
    initialState: T,
    devtoolsOptions?: DevtoolsOptions,
) =>
    createStoreFunction(
        subscribeWithSelector(immer(devtools(redux(reducer, initialState), devtoolsOptions))),
    );

/**
 * 创建包含订阅，immer以及devtoools功能的reducer状态商店
 * @param reducer
 * @param initialState
 * @param persistOptions
 * @param devtoolsOptions
 */
export const createPersistReduxStore = <
    T extends object,
    A extends {
        type: string;
    },
    P = T,
>(
    reducer: (state: T, action: A) => T,
    initialState: T,
    persistOptions: PersistOptions<T, P>,
    devtoolsOptions?: DevtoolsOptions,
) =>
    createStoreFunction(
        subscribeWithSelector(
            immer(
                devtools(
                    persist(redux(reducer, initialState), persistOptions as any),
                    devtoolsOptions,
                ),
            ),
        ),
    );
