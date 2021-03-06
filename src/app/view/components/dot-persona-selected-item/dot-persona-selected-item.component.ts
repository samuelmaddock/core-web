import { Component, Input, Output, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { DotPersona } from '@models/dot-persona/dot-persona.model';
import { DotMessageService } from '@services/dot-messages-service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'dot-persona-selected-item',
    templateUrl: './dot-persona-selected-item.component.html',
    styleUrls: ['./dot-persona-selected-item.component.scss']
})
export class DotPersonaSelectedItemComponent implements OnInit {
    @Input()
    persona: DotPersona;

    @Input()
    isEditMode = false;

    @Input()
    @HostBinding('class.disabled')
    disabled: boolean;

    @Output()
    selected = new EventEmitter<MouseEvent>();

    messages: { [key: string]: string } = {};

    constructor(private dotMessageService: DotMessageService) {}

    ngOnInit() {
        this.dotMessageService
            .getMessages([
                'modes.persona.selector.title.preview',
                'modes.persona.selector.title.edit',
                'modes.persona.no.persona',
                'editpage.personalization.content.add.message'
            ])
            .pipe(take(1))
            .subscribe((messages: { [key: string]: string }) => {
                this.messages = messages;
            });
    }
}
