import {useState, useEffect} from 'react';

/**
 * Ein Hook, der einen Wert verzögert, um zu häufige Aktualisierungen zu vermeiden
 * Nützlich für Suche, bei der man nicht bei jedem Tastendruck eine API anfragen möchte
 *
 * @param value Der zu verzögernde Wert
 * @param delay Verzögerung in Millisekunden
 * @returns Der verzögerte Wert
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Timer für die Verzögerung setzen
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Aufräumen, wenn sich value oder delay ändert oder der Komponent unmounted wird
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
