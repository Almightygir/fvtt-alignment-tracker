console.log('AlignmentTracker | Im running!');

class AlignmentForm extends FormApplication
{
    static get defaultOptions()
    {
        const defaults = super.defaultOptions;

        const overrides =
        {
            height: '512',
            width: '512',
            id: 'Alignment',
            title: 'Alignment',
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
}

function newAlignmentSettingsWindow(actor)
{
    const alignments = ["lg", "ng", "cg", "ln", "tn", "cn", "le", "ne", "ce"]

    console.log('AlignmentTracker | Click!');
    actor.update({ "data.details.alignment": alignments[getRandomInt(9)] });
    console.log('AlignmentTracker | New alignment: %s!', actor.data.data.details.alignment);
}

function overrideAlignmentSettingsButton(sheet, jq, data)
{
    const actor = data.actor;
    if (!actor || !actor.isOwner)
    {
        console.log('AlignmentTracker | No valid actor, or actor owner!');
        return;
    }

    const html = jq[0];
    const tab = html.querySelector(`.tab.summary`);
    if (!tab)
    {
        console.log('AlignmentTracker | No valid summary tab!');
        return;
    }

    const alignmentButton = tab.querySelector(`.controls.alignment`)
    if (!alignmentButton)
    {
        console.log('AlignmentTracker | No valid alignment button!');
        return;
    }

    alignmentButton.addEventListener("click", event =>
    {
        console.log('AlignmentTracker | Alignment settings button clicked, opening new window instead!');
        event.stopImmediatePropagation();
        newAlignmentSettingsWindow(actor);
        let alignmentForm = new AlignmentForm(actor).render(true, { actor });
        // This will be called instead of any existing event listeners
    }, true);
}

Hooks.on('renderActorSheetPF', overrideAlignmentSettingsButton);