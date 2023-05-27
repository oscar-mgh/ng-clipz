import { Injectable } from '@angular/core';

interface Modal {
    id: string;
    visible: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private modals: Modal[] = [];

    constructor() {}

    register(id: string) {
        this.modals.push({
            id,
            visible: false,
        });
    }

    unregister(id: string) {
        this.modals = this.modals.filter(el => el.id !== id);
    }

    isModalVisible(id: string): boolean {
        return !!this.modals.find(el => el.id === id)?.visible; //? if undefined it will return false with '!!'
    }

    toggleModal(id: string) {
        const modal = this.modals.find(el => el.id === id);
        if (modal) {
            modal.visible = !modal.visible;
        }
    }
}
