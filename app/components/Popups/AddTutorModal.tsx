"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Tutor } from "@/app/types/types";
import { InputField } from "../Fields/InputField";

interface FormModalProps {
    isOpen: boolean;
    initialData?: Tutor;
    onClose: () => void;
    onSubmit: (data: Tutor) => void;
    title: string;
}

export const FormModalTutor = ({
    isOpen,
    initialData,
    onClose,
    onSubmit,
    title,
}: FormModalProps) => {
    const emptyForm = useMemo<Partial<Tutor>>(() => ({
        name: "",
        email: "",
        password: "Hola1234!",
    }), []);

    // Estado del formulario y de la contraseña generada
    const [formData, setFormData] = useState<Partial<Tutor>>(emptyForm);

    // Sincronizar con initialData
    useEffect(() => {
        setFormData(initialData || emptyForm);
    }, [initialData, emptyForm]);

    const handleFieldChange = (field: keyof Tutor, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    const handleCancel = () => {
        setFormData(emptyForm);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Tutor);
        handleCancel();
    };

    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onClose={handleCancel}
            buttons={
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-blue_principal rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue_principal text-white rounded"
                    >
                        Guardar
                    </button>
                </div>
            }
        >
            <form className="space-y-4 px-6" onSubmit={handleSubmit}>
                <InputField
                    label="Nombre"
                    type="text"
                    value={formData.name || ""}
                    onChange={v => handleFieldChange('name', v)}
                    placeholder="Nombre del tutor"
                    isRequired={true}
                />

                <InputField
                    label="Email"
                    type="email"
                    value={formData.email || ""}
                    onChange={v => handleFieldChange('email', v)}
                    placeholder="Email del tutor"
                    isRequired={true}
                />

                {/* <div className="flex items-end gap-4">
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2 bg-gray-200 rounded"
                    >
                        Generar Contraseña
                    </button>
                    <InputField
                        label="Contraseña"
                        type="text"
                        value={password}
                        onChange={() => {  }}
                        placeholder="Aquí se mostrará la contraseña"
                        isRequired={false}
                    />
                </div> */}
            </form>
        </Modal>
    );
};
