import { useContext } from 'react';
import StorageContext from '../context/StorageContext';

export default function useStorage() {
    const context = useContext(StorageContext);
    if (!context) {
        throw new Error('useStorage phải được sử dụng bên trong StorageProvider');
    }
    return context;
}
