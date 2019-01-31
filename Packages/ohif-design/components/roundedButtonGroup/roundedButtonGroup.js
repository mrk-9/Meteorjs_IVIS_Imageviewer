Template.roundedButtonGroup.onCreated(() => {
    const instance = Template.instance();
    const reactiveValue = instance.data.value;

    // Get the value for ReactiveVar or ReactiveDict objects
    instance.getValue = () => {
        //console.log(reactiveValue.get(instance.data.key));
        return reactiveValue.get(instance.data.key);
    };

    // Set the value for ReactiveVar or ReactiveDict objects
    instance.setValue = value => {
        const args = [value];
        if (reactiveValue instanceof ReactiveDict) {
            args.unshift(instance.data.key);
        }

        reactiveValue.set(...args);
    };
    //console.log('getValue::', instance.getValue());
    //console.log('toggleable::', instance.data.toggleable);
    // Initialize the value with the first option if there's no value set and options are not toggleable
    if (!instance.getValue() && !instance.data.toggleable) {
        instance.setValue(instance.data.options[0].value);
    }
    if($(window).width() < 961) {
        //const dataValue = $(".roundedButtonWrapper").attr('data-value');
        //console.log('dataValue::', dataValue);
        instance.setValue('studies');
    }
});

Template.roundedButtonGroup.events({
    'click [data-value]'(event, instance) {
        event.preventDefault();
        const $target = $(event.currentTarget);
        // Stop here if the tool is disabled
        if ($target.hasClass('disabled')) {
            return;
        }
        const nullValue = $target.hasClass('active') && instance.data.toggleable;
        const value = nullValue ? null : $target.attr('data-value');        
        instance.setValue(value);
    }
});

Template.roundedButtonGroup.helpers({
    getValue() {
        return Template.instance().getValue();
    }
});
