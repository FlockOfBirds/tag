declare module "react-tagsinput" {

    interface TagData {
        guid: string;
        text: string;
    }

    interface TagsInputProps {
        value: any[];
        onChange: (tags: any[], changed: any[], changedIndexes: number[]) => void;
        addKeys?: number[];
        onlyUnique?: boolean;
        validationRegex?: RegExp;
        maxTags?: number;
        addOnBlur?: boolean;
        addOnPaste?: boolean;
        disabled?: boolean;
        inputValue?: string;
        onChangeInput?: (tag: string) => void;
        pasteSplit?: (data: any) => void;
        removeKeys?: number[];
        className?: string;
        focusedClassName?: string;
        tagProps?: React.HTMLProps<HTMLElement>;
        inputProps?: React.HTMLProps<HTMLInputElement>;
        renderTag?: (props: React.HTMLProps<HTMLElement> & {key: string, tag: any}) => void;
        renderInput?: (props: React.HTMLProps<HTMLInputElement> & {value: string, addTag: any}) => void;
        renderLayout?: (tagComponts: React.Component<any, any>, inputComponentL: React.Component<any, any>) => void;
    }

    const TagsInput: React.ComponentClass<TagsInputProps>;

    export = TagsInput;
}
