import { useEffect, useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { SiteStruct } from "../../types";
import { sendMessage } from "../functions";
import Button from "../ui/Button";
import Input from "../ui/Input";
import AddOrEditSite from "./AddOrEditSite";
import SiteRow from "./SiteRow";

const EditingBody: React.FC<{
    setIsEditing: (value: React.SetStateAction<boolean>) => void;
}> = ({ setIsEditing }) => {
    // Toggle for showing the 'add a new item' form
    const [showAddNew, setShowAddNew] = useState(false);

    const [sites]: [SiteStruct[], any, any, any] =
        useChromeStorageLocal("sites", []);

    const [nameValue] = useState("");
    const [urlValue, setUrlValue] = useState("");

    useEffect(() => {
        sendMessage({ type: "GET_SITE_INFO" })
            .then((response) => {
                // TODO - decide if we want to autofill the name value for adding a new site
                // setNameValue(
                //     response.payload.title
                //         ? response.payload.title.substring(0, 50)
                //         : ""
                // );
                setUrlValue(response.payload.searchUrl || "");
            })
            .catch(console.log);
    }, []);

    const [copiedSuccess, setCopiedSuccess] = useState(false);
    const showAddNewSiteHandler = async () => {
        setShowAddNew((prev) => !prev);
        try {
            await navigator.clipboard.writeText("azbycxdvew");
            setCopiedSuccess(true);
        } catch (e) {
            console.log(e); // copying failed
        }
    };

    const addSubmitHandler = (site: SiteStruct) => {
        sendMessage({ type: "ADD_SITE", payload: { site } })
            .then(() => {
                setShowAddNew(false);
            })
            .catch(console.log);
    };

    // const exportHandler = async () => {
    //     // Copy the site JSON string to clipboard
    //     try {
    //         await navigator.clipboard.writeText(JSON.stringify(sites));
    //         alert("Copied to clipboard!");
    //     } catch (e) {
    //         console.log(e);
    //     }
    // };

    const [showImport, setShowImport] = useState(false);
    const [importString, setImportString] = useState("");
    const importHandler = () => {
        try {
            const parsed = JSON.parse(importString);
            sendMessage({ type: "IMPORT", payload: { sites: parsed } })
                .then(() => setShowImport(false))
                .catch(console.log);
        } catch (e) {
            alert("Invalid JSON!");
        }
    };
    return (
        <div className="body my-2">
            <div className="flex justify-end buttons mb-2">
                {/* <Button onClick={() => exportHandler()}>Export</Button>
                <Button
                    classes="mx-1"
                    onClick={() => setShowImport((prev) => !prev)}
                >
                    Import
                </Button> */}
                <Button onClick={() => showAddNewSiteHandler()}>
                    Add new site
                </Button>
                <Button
                    classes="ml-1"
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    Back to home
                </Button>
            </div>

            {/* <div className="mt-1 flex justify-end">
                <Button onClick={() => setIsEditing((prev) => !prev)}>
                    Back to home
                </Button>
            </div> */}
            {showAddNew && (
                <AddOrEditSite
                    submitHandler={addSubmitHandler}
                    name={nameValue}
                    url={urlValue}
                    isEditing={false}
                    copiedSuccess={copiedSuccess}
                />
            )}
            {showImport && (
                <div>
                    <Input
                        placeholder="Paste the JSON string here"
                        value={importString}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setImportString(e.target.value)
                        }
                    />
                    <div className="flex justify-center">
                        <Button onClick={() => importHandler()}>Import</Button>
                    </div>
                </div>
            )}
            {sites &&
                sites.map((site: SiteStruct, index) => (
                    <SiteRow key={index} site={site} />
                ))}
        </div>
    );
};

export default EditingBody;
