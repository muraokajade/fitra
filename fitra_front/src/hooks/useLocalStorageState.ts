import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T){
    const [value, setValue] = useState<T>(initial);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if(raw != null) setValue(JSON.parse(raw) as T)
        } catch {
        
        }finally {
            setHydrated(true)
        }
    })
}