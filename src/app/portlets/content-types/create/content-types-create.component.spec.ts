import { ActivatedRoute, Params, UrlSegment } from '@angular/router';
import { async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ComponentFixture } from '@angular/core/testing';
import { ContentTypesCreateComponent } from './content-types-create.component';
import { ContentTypesFormComponent} from '../common/content-types-form';
import { ContentTypesInfoService } from '../../../api/services/content-types-info';
import { ContentTypesLayoutComponent } from '../common/content-type-layout/content-types-layout.component';
import { CrudService } from '../../../api/services/crud/crud.service';
import { DebugElement, Component, Input, Output, EventEmitter } from '@angular/core';
import { DOTTestBed } from '../../../test/dot-test-bed';
import { FieldValidationMessageModule } from '../../../view/components/_common/field-validation-message/file-validation-message.module';
import { LoginService } from '../../../api/services/login-service';
import { LoginServiceMock } from '../../../test/login-service.mock';
import { MessageService } from '../../../api/services/messages-service';
import { MockMessageService } from '../../../test/message-service.mock';
import { Observable } from 'rxjs/Observable';
import { OverlayPanelModule, ConfirmationService } from 'primeng/primeng';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { StringUtils } from '../../../api/util/string.utils';

@Component({
    selector: 'content-type-fields-drop-zone',
    template: ''
})
class TestContentTypeFieldsRowComponent {

}

@Component({
    selector: 'content-type-layout',
    template: '<ng-content></ng-content>'
})
class TestContentTypeLayout {

}

@Component({
    selector: 'content-types-form',
    template: ''
})
class TestContentTypesForm {
    @Input() icon: string;
    @Input() name: string;
    @Input() type: string;
    @Output() onCancel: EventEmitter<any> = new EventEmitter();
    @Output() onSubmit: EventEmitter<any> = new EventEmitter();

    public resetForm(): void {}
}

describe('ContentTypesCreateComponent', () => {
    let comp: ContentTypesCreateComponent;
    let fixture: ComponentFixture<ContentTypesCreateComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let route: ActivatedRoute;
    let url: UrlSegment[];

    beforeEach(async(() => {
        let messageServiceMock = new MockMessageService({
            'Content': 'Content',
            'File': 'File',
            'Form': 'Form',
            'Page': 'Page',
            'Persona': 'Persona',
            'Widget': 'Widget'
        });

        DOTTestBed.configureTestingModule({
            declarations: [
                ContentTypesCreateComponent,
                TestContentTypesForm,
                TestContentTypeLayout,
                TestContentTypeFieldsRowComponent
            ],
            imports: [
                RouterTestingModule.withRoutes([{
                    component: ContentTypesCreateComponent,
                    path: 'test'
                }])
            ],
            providers: [
                { provide: LoginService, useClass: LoginServiceMock },
                { provide: MessageService, useValue: messageServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: {'params': Observable.from([{ id: '1234' }])}
                },
                ConfirmationService,
                CrudService,
                ContentTypesInfoService,
                StringUtils
            ]
        });

        fixture = DOTTestBed.createComponent(ContentTypesCreateComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        route = fixture.debugElement.injector.get(ActivatedRoute);
    }));

    it('should have Content Types Layout', () => {
        let contentTypeLayout = de.query(By.css('content-type-layout'));
        expect(contentTypeLayout).not.toBeNull();
    });

    it('should have Content Types Form', () => {
        url = [
            new UrlSegment('create', { name: 'create' }),
            new UrlSegment('content', { name: 'content' })
        ];

        route.url = Observable.of(url);

        fixture.detectChanges();

        let contentTypeLayout = de.query(By.css('content-type-layout'));
        let contentTypeForm = contentTypeLayout.query(By.css('content-types-form'));
        let contentTypeFormComponentInstance = contentTypeForm.componentInstance;

        expect(contentTypeForm).not.toBeNull();

        expect('content').toEqual(contentTypeFormComponentInstance.type);
        expect('fa-newspaper-o').toEqual(contentTypeFormComponentInstance.icon);
        expect('Content').toEqual(contentTypeFormComponentInstance.name);

    });

    it('should have call content types endpoint with content data', () => {
        url = [
            new UrlSegment('create', { name: 'create' }),
            new UrlSegment('content', { name: 'content' })
        ];

        route.url = Observable.of(url);

        fixture.detectChanges();

        let crudService = fixture.debugElement.injector.get(CrudService);
        spyOn(crudService, 'postData').and.returnValue(Observable.of({}));

        comp.handleFormSubmit({
            originalEvent: Event,
            value: {
                host: '12345',
                name: 'Hello World'
            }
        });

        let mockData = {
            clazz: 'com.dotcms.contenttype.model.type.ImmutableSimpleContentType',
            defaultType: false,
            fixed: false,
            folder: 'SYSTEM_FOLDER',
            host: '12345',
            name: 'Hello World',
            owner: '123',
            system: false
        };

        expect(crudService.postData).toHaveBeenCalledWith('v1/contenttype', mockData);
    });

    it('should have call content types endpoint with widget data', () => {
        url = [
            new UrlSegment('create', { name: 'create' }),
            new UrlSegment('widget', { name: 'widget' })
        ];

        route.url = Observable.of(url);

        fixture.detectChanges();

        let crudService = fixture.debugElement.injector.get(CrudService);
        spyOn(crudService, 'postData').and.returnValue(Observable.of({}));

        comp.handleFormSubmit({
            originalEvent: Event,
            value: {
                host: '12345',
                name: 'Hello World'
            }
        });

        let mockData = {
            clazz: 'com.dotcms.contenttype.model.type.ImmutableWidgetContentType',
            defaultType: false,
            fixed: false,
            folder: 'SYSTEM_FOLDER',
            host: '12345',
            name: 'Hello World',
            owner: '123',
            system: false
        };

        expect(crudService.postData).toHaveBeenCalledWith('v1/contenttype', mockData);
    });
});