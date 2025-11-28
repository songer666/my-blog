"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { FieldGroup } from '@/components/shadcn/ui/field';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { useProjectOperations } from '@/client/project-api';
import { useProjectDraftStore } from '@/store/project/store';
import { useBreadCrumbStore } from '@/store/breadcrumb/store';
import { ProjectType } from '@/server/types/project-type';
import { TitleField } from './fields/title-field';
import { SlugField } from './fields/slug-field';
import { DescriptionField, ImageField, KeyWordsField } from './fields/basic-fields';
import { GithubUrlField, DemoUrlField } from './fields/url-fields';
import { ContentField } from './fields/content-field';
import { CreatedAtField } from './fields/created-at-field';
import { generateProjectSlug } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import styles from './project-save-form.module.css';

interface ProjectSaveFormProps {
    mode: 'create' | 'edit';
    initialData?: ProjectType;
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
}

export function ProjectSaveForm({ mode, initialData, onSuccess }: ProjectSaveFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    
    const { createProject, updateProject } = useProjectOperations();
    const { setCrumbs } = useBreadCrumbStore(state => ({
        setCrumbs: state.setCrumbs
    }));
    
    // Zustand store (仅在创建模式下使用)
    const {
        draft,
        updateField,
        clearDraft,
        markSaved,
        isDirty
    } = useProjectDraftStore(state => ({
        draft: state.draft,
        updateField: state.updateField,
        clearDraft: state.clearDraft,
        markSaved: state.markSaved,
        isDirty: state.isDirty
    }));
    
    const isEditMode = mode === 'edit';
    const isCreateMode = mode === 'create';

    // 初始化表单数据
    const getInitialValues = () => {
        if (isEditMode && initialData) {
            return {
                title: initialData.title,
                description: initialData.description,
                slug: initialData.slug,
                content: initialData.content,
                image: initialData.image || '',
                githubUrl: initialData.githubUrl || '',
                demoUrl: initialData.demoUrl || '',
                keyWords: initialData.keyWords || '',
                createdAt: initialData.createdAt ? new Date(initialData.createdAt) : undefined,
            };
        }
        
        if (isCreateMode) {
            return {
                title: draft.title,
                description: draft.description,
                slug: draft.slug,
                content: draft.content,
                image: draft.image || '',
                githubUrl: draft.githubUrl || '',
                demoUrl: draft.demoUrl || '',
                keyWords: draft.keyWords || '',
            };
        }
        
        return {
            title: '',
            description: '',
            slug: '',
            content: '',
            image: '',
            githubUrl: '',
            demoUrl: '',
            keyWords: '',
            createdAt: undefined,
        };
    };

    const form = useForm({
        defaultValues: getInitialValues(),
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                
                const projectData: any = {
                    title: values.value.title,
                    description: values.value.description,
                    slug: values.value.slug,
                    content: values.value.content,
                    image: values.value.image || undefined,
                    githubUrl: values.value.githubUrl || undefined,
                    demoUrl: values.value.demoUrl || undefined,
                    keyWords: values.value.keyWords || undefined,
                };
                
                // 在编辑模式下保留原有的可见性状态，创建模式下默认为 false
                if (isEditMode && initialData) {
                    projectData.visible = initialData.visible;
                } else {
                    projectData.visible = false; // 创建时默认不可见
                }
                
                // 如果提供了自定义创建时间
                if (values.value.createdAt) {
                    projectData.createdAt = values.value.createdAt;
                }

                let result;
                if (isEditMode && initialData) {
                    result = await updateProject(initialData.id, projectData);
                } else {
                    result = await createProject(projectData);
                }
                
                // 保存成功后的处理
                if (result.success) {
                    if (isCreateMode) {
                        // 创建成功后清除草稿
                        clearDraft();
                    } else {
                        // 编辑成功后标记为已保存
                        markSaved();
                    }
                    
                    if (onSuccess) {
                        onSuccess(result.data);
                    } else {
                        // 默认跳转到项目详情页或管理首页
                        if (isEditMode) {
                            router.push(`/admin/dashboard/project/${result.data?.id}`);
                        } else if (result.data?.id) {
                            router.push(`/admin/dashboard/project/${result.data.id}`);
                        } else {
                            router.push('/admin/dashboard');
                        }
                        router.refresh();
                    }
                }
            } catch (error: any) {
                // 错误处理已经在 API 层完成
                console.error(isEditMode ? '更新项目错误:' : '创建项目错误:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    // 创建模式下初始化表单数据（从持久化的 store 中获取）
    useEffect(() => {
        if (isCreateMode && draft) {
            // 将 store 中的草稿数据同步到表单
            form.setFieldValue('title', draft.title);
            form.setFieldValue('description', draft.description);
            form.setFieldValue('slug', draft.slug);
            form.setFieldValue('content', draft.content);
            form.setFieldValue('image', draft.image || '');
            form.setFieldValue('githubUrl', draft.githubUrl || '');
            form.setFieldValue('demoUrl', draft.demoUrl || '');
            form.setFieldValue('keyWords', draft.keyWords || '');
        }
    }, [isCreateMode, draft, form]);

    // 创建模式下同步表单数据到 store
    useEffect(() => {
        if (isCreateMode) {
            const syncToStore = () => {
                const values = form.getFieldValue;
                updateField('title', values('title') || '');
                updateField('description', values('description') || '');
                updateField('slug', values('slug') || '');
                updateField('content', values('content') || '');
                updateField('image', values('image') || '');
                updateField('githubUrl', values('githubUrl') || '');
                updateField('demoUrl', values('demoUrl') || '');
                updateField('keyWords', values('keyWords') || '');
            };
            
            // 设置定时同步（每2秒同步一次）
            const interval = setInterval(syncToStore, 2000);
            
            return () => {
                clearInterval(interval);
            };
        }
    }, [isCreateMode, form, updateField]);

    // 编辑模式下更新面包屑显示项目 slug
    useEffect(() => {
        if (isEditMode && initialData && pathname.startsWith('/admin/dashboard/projects/edit/')) {
            setCrumbs([
                { title: "项目栏" },
                { title: "编辑项目" },
                { title: initialData.slug }
            ]);
        }
    }, [isEditMode, initialData, pathname, setCrumbs]);

    // 自动生成 slug
    const handleTitleChange = (title: string) => {
        form.setFieldValue('title', title);
        
        // 如果 slug 为空或者是自动生成的，则自动更新
        const currentSlug = form.getFieldValue('slug');
        if (!currentSlug || currentSlug === generateProjectSlug(form.getFieldValue('title'))) {
            const newSlug = generateProjectSlug(title);
            form.setFieldValue('slug', newSlug);
        }
    };

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('表单提交被触发，模式:', mode);
        void form.handleSubmit();
    };

    return (
        <div className={styles.container}>
            <form
                onSubmit={handleSubmit}
                className={styles.form}
                aria-busy={isSubmitting}
                noValidate
            >
                <FieldGroup className={styles.fieldGroup}>
                    <form.Field
                        name="title"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value?.trim()) {
                                    return { message: '标题不能为空' };
                                }
                                if (value.length > 200) {
                                    return { message: '标题不能超过200个字符' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <TitleField
                                field={field}
                                isSubmitting={isSubmitting}
                                onTitleChange={handleTitleChange}
                            />
                        )}
                    />

                    <form.Field
                        name="description"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value?.trim()) {
                                    return { message: '描述不能为空' };
                                }
                                if (value.length > 500) {
                                    return { message: '描述不能超过500个字符' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <DescriptionField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />

                    <form.Field
                        name="slug"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value?.trim()) {
                                    return { message: 'URL别名不能为空' };
                                }
                                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                                    return { message: 'URL别名格式不正确，只能包含小写字母、数字和连字符' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <SlugField
                                field={field}
                                isSubmitting={isSubmitting}
                                title={form.getFieldValue('title') || ''}
                                excludeId={isEditMode ? initialData?.id : undefined}
                            />
                        )}
                    />

                    <form.Field
                        name="image"
                        children={(field) => (
                            <ImageField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />
                    
                    <form.Field
                        name="githubUrl"
                        validators={{
                            onBlur: ({ value }) => {
                                if (value && value.trim() && !/^https?:\/\/.+/.test(value)) {
                                    return { message: 'GitHub链接格式不正确' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <GithubUrlField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />
                    
                    <form.Field
                        name="demoUrl"
                        validators={{
                            onBlur: ({ value }) => {
                                if (value && value.trim() && !/^https?:\/\/.+/.test(value)) {
                                    return { message: '演示链接格式不正确' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <DemoUrlField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />
                    
                    <form.Field
                        name="keyWords"
                        children={(field) => (
                            <KeyWordsField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />

                    <form.Field
                        name="content"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value?.trim()) {
                                    return { message: '内容不能为空' };
                                }
                                return undefined;
                            }
                        }}
                        children={(field) => (
                            <ContentField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />

                    <form.Field
                        name="createdAt"
                        children={(field) => (
                            <CreatedAtField
                                field={field}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />
                </FieldGroup>

                <div className={styles.submitSection}>
                    {isCreateMode && isDirty && (
                        <div className={styles.draftStatus}>
                            <span className={styles.draftText}>草稿已自动保存</span>
                        </div>
                    )}
                    
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer w-auto"
                    >
                        {isSubmitting ? (
                            <span className={styles.loadingContent}>
                                <Spinner className={styles.spinner} aria-hidden="true" />
                                <span>{isEditMode ? '更新中...' : '创建中...'}</span>
                            </span>
                        ) : (
                            isEditMode ? '更新项目' : '创建项目'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

