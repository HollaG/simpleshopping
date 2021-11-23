import { handleChromeError, uid } from "../components/functions";

import {
    DOMMessage,
    DOMMessageResponse,
    GroupStruct,
    SiteStruct,
} from "../types";

// Function called when a new message is received
const messagesFromReactAppListener = (
    msg: DOMMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: DOMMessageResponse) => void
) => {
    if (chrome.runtime.lastError) {
        handleChromeError(chrome.runtime.lastError);
    } else {
        console.log("[content.js]. Message received", msg);

        const selected = window.getSelection()?.toString() || "";

        // Get the sites that are stored in the chrome storage api

        chrome.storage.local.get("sites", function (result) {
            console.log("Value currently is ", result.sites);

            console.log("MESSAGE TYPE", msg.type);
            switch (msg.type) {
                case "GET_SELECTED": {
                    sendResponse({
                        payload: { text: selected, currentUrl: document.URL },
                    });
                    break;
                }
                case "GET_SITE_INFO": {
                    const response: DOMMessageResponse = {
                        payload: {
                            title: document.title,
                            searchUrl: document.URL,
                        },
                    };
                    sendResponse(response);
                    break;
                }
                case "ADD_SITE": {
                    console.log("SWITCH ADD SITE");
                    const payload: SiteStruct = msg.payload.site;

                    const sites = [...result.sites, payload].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                    chrome.storage.local.set({ sites }, function () {
                        console.log("Value is set to ", { sites });
                        const response: DOMMessageResponse = {
                            payload: {
                                text: selected,
                                sites,
                            },
                        };
                        sendResponse(response);
                    });
                    break;
                }

                case "EDIT_SITE": {
                    /* Required payload: 
                        {
                            payload: {
                                site: SiteStruct[],
                            }  
                        }
                        References: 
                        - Body.tsx (enabling/disabling)
                        - SiteRow.tsx (enabling/disabling, editing fields)
                    */
                    const sites: SiteStruct[] = [...result.sites];
                    const site: SiteStruct = msg.payload.site;
                    // const index: number = msg.payload.index;
                    const index = sites.findIndex(
                        (oldSite) => oldSite.id === site.id
                    );
                    sites[index] = site;
                    chrome.storage.local.set({ sites }, function () {
                        console.log("Value is set to ", { sites });
                        const response: DOMMessageResponse = {
                            payload: {
                                text: selected,
                                sites,
                            },
                        };
                        sendResponse(response);
                    });

                    break;
                }

                case "REMOVE_SITE": {
                    console.log("SWITCH REMOVE SITE");

                    const site: SiteStruct = msg.payload.site;
                    const sites: SiteStruct[] = [...result.sites];
                    const filtered = sites.filter(
                        (oldSite) => oldSite.id !== site.id
                    );

                    // if (index >= 0 && index < sites.length) {
                    //     sites.splice(index, 1);
                    //     console.log("Spliced sites,", { sites, index });
                    chrome.storage.local.set({ sites: filtered }, function () {
                        console.log("Value is set to ", { sites });
                        const response: DOMMessageResponse = {
                            payload: {
                                text: selected,
                                sites,
                            },
                        };
                        sendResponse(response);
                    });
                    // }
                    break;
                }
                case "IMPORT": {
                    const sites = msg.payload.sites;
                    chrome.storage.local.set({ sites }, function () {
                        console.log("Value is set to ", { sites });
                        const response: DOMMessageResponse = {
                            payload: {
                                text: selected,
                                sites,
                            },
                        };
                        sendResponse(response);
                    });
                    break;
                }
                // case "GET_GROUPS": {
                //     chrome.storage.local.get("groups", function (result) {
                //         // Testing groups
                //         const testing: GroupStruct[] = [
                //             {
                //                 name: "Test",
                //                 enabled: ["all"],
                //                 id: "test",
                //             },

                //             {
                //                 name: "Test2",
                //                 enabled: ["all"],
                //                 id: "test2",
                //             },
                //         ];
                //         const response: DOMMessageResponse = {
                //             payload: {
                //                 groups: result.groups || testing,
                //             },
                //         };
                //         sendResponse(response);
                //     });
                //     break;
                // }
                case "SAVE_GROUP": {
                    // Save the current arrangement of enabled / disabled sites as a group

                    const sites: SiteStruct[] = result.sites;
                    const enabled = sites
                        .filter((site) => site.enabled)
                        .map((site) => site.id);
                    chrome.storage.local.get(
                        "groups",
                        function (groupResults) {
                            const groups: GroupStruct[] =
                                groupResults.groups || [];
                            chrome.storage.local.set(
                                {
                                    groups: [
                                        ...groups,
                                        {
                                            enabled,
                                            id: uid(),
                                            name: (
                                                groups.length + 1
                                            ).toString(),
                                        },
                                    ],
                                },
                                function () {
                                    const response: DOMMessageResponse = {
                                        payload: {
                                            text: selected,
                                            sites,
                                        },
                                    };
                                    sendResponse(response);
                                }
                            );
                        }
                    );

                    break;
                }

                case "EDIT_GROUP": {
                    const updatedGroup = msg.payload.group;
                    chrome.storage.local.get(
                        "groups",
                        function (groupResult) {
                            // Update the group array
                            const groups:GroupStruct[] = groupResult.groups || [];
                            const index = groups.findIndex(group => group.id === updatedGroup.id);
                            if (index > -1) groups[index] = updatedGroup;
                            chrome.storage.local.set({ groups }, function () {
                                const response: DOMMessageResponse = {
                                    payload: {
                                        text: selected,
                                       
                                    },
                                };
                                sendResponse(response);
                            });
                        }
                    );
                    break;
                }

                default: {
                    const response: DOMMessageResponse = {
                        payload: {
                            text: selected,
                            sites: result.sites,
                            currentUrl: document.URL,
                        },
                    };
                    sendResponse(response);
                }
            }
        });
    }
    return true;
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime &&
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

// chrome.contextMenus.onClicked.addListener(function (info, tab) {
//     chrome.storage.local.get("sites", function (result) {
//         const selected = window.getSelection()?.toString() || "";

//         const userSites:Site[] = result.sites ? JSON.parse(result.sites) : []

//         if (info.menuItemId === "context__open_all") {
//             userSites.forEach(site => {
//                 chrome.tabs.create({
//                     url: `${site.searchUrl}${encodeURIComponent(selected)}`,
//                     active: false,
//                 });
//             })
//         }
//     })
//     return true
// })
