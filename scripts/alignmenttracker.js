console.log('AlignmentTracker | Im running!');

function overrideAlignmentSettingsButton(sheet, jq, data)
{
    const actor = data.actor;
    if(!actor || actor.isOwner)
    {
        console.log('AlignmentTracker | No valid actor, or actor owner!');
        return;
    }

    const html = jq[0];
    const tab = html.querySelector(`.tab.summary`);
    if(!tab)
    {
        console.log('AlignmentTracker | No valid summary tab!');
        return;
    }

    //const alignmentButton = tab.querySelector(``)
}

Hooks.on('renderActorSheetPF', overrideAlignmentSettingsButton);