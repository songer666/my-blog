import {JSX, MouseEventHandler, RefObject, useCallback, useEffect, useState} from "react";
import {Button} from "@/components/shadcn/ui/button";
import {Check, Copy} from "lucide-react";
import {isNil} from "lodash";
import {createRoot} from "react-dom/client";

export function CopyCode({wrapperEl}: {wrapperEl: Element | null}) {
    const [copied, setCopied] = useState(false);
    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>
    ((e)=>{
        e.preventDefault();
        if (isNil(wrapperEl)) return;
        const contentEl = wrapperEl.querySelector('.code-content') as HTMLElement;
        if (isNil(contentEl)) return;
        navigator.clipboard.writeText(contentEl.textContent || '');
        setCopied(true);
        setTimeout(()=>{
            setCopied(false);
        },3000);
    },[wrapperEl]);
    return <Button 
        variant={'ghost'} 
        size={'icon'} 
        className={'code-copy'} 
        onClick={handleClick}
    >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
}

/**
 * 代码框
 * @param ref
 * @param content
 */
export function useCodeWindow (
    ref: RefObject<HTMLDivElement | null>,
    content: JSX.Element | null,
){
    const [wrapperEls, setWrapperEls] = useState<NodeListOf<Element> | undefined>();
    const preventSummaryToggle = useCallback((e: Event) => e.preventDefault(), []);
    useEffect(() => {
        if (!wrapperEls) return;
        wrapperEls.forEach((wrapperEl) => {
            // 将复制按钮放到最外层容器上
            let toolsEl = wrapperEl.querySelector('div.code-tools') as HTMLElement;
            if (isNil(toolsEl)) {
                toolsEl = document.createElement('div');
                toolsEl.className = 'code-tools';
                wrapperEl.appendChild(toolsEl);
                const toolsNodes = createRoot(toolsEl);
                toolsNodes.render(<CopyCode wrapperEl={wrapperEl} />);
            }
        });
        return () => {
            // cleanup if needed
        };
    }, [wrapperEls]);

    useEffect(() => {
        if (!ref.current || !content) return;
        const wrapperEls = ref.current?.querySelectorAll('.code-window');
        setWrapperEls(wrapperEls);
    }, [content]);
};