export interface SiteStruct {
    name: string;
    url: string;
    searchUrl: string;
    enabled: boolean;
    
    icon?: string;
    id: string;
}

export interface GroupStruct {
    name: string;
    enabled: string[];
    id: string,
    number: number;
}

export interface DOMMessageResponse {
    
    payload: {
        text?: string,
        sites?: SiteStruct[],
        title?: string,
        searchUrl?: string,
        currentUrl? :string,
        [key:string]:any
    }
}

export interface DOMMessage { 
    type: "TEST_MESSAGE"|"GET_SELECTED"|"GET_SITE_INFO"|"ADD_SITE"|"EDIT_SITE"|"REMOVE_SITE"|"IMPORT"|"SAVE_GROUP"|"EDIT_GROUP"|"DELETE_GROUP",
    // payload?: {
    //     index?: number,
    //     name?: string,
    //     url?: string,
    //     searchUrl?: string,
    //     enabled?: boolean
    // }
    payload?: any
}