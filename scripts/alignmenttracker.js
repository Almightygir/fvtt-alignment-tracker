console.log('AlignmentTracker | Im running!');

class AlignmentTracker
{
    static ID = 'AlignmentTracker';
    static FLAGS = { TRACKEDALIGNMENTS: 'Alignments' }

    static TEMPLATES = { AlignmentTracker: `modules/${this.ID}/templates/alignmenttracker.hbs` }

    static IMAGE = { AlignmentWheel: `modules/${this.ID}/images/alignmentwheel.png` }

    static PI = 3.1415926;
    static TWOPI = 2 * this.PI;

    static FORCELOGS = false;

    static log(force, ...args)
    {
        const shouldLog = force || this.FORCELOGS;

        if (shouldLog)
        {
            console.log(this.ID, '|', ...args);
        }
    }

    static ALIGNMENTS = ["cn", "ce", "ne", "le", "ln", "lg", "ng", "cg", "tn"];
    static ALIGNMENTSLONG = ["Chaotic Neutral", "Chaotic Evil", "Neutral Evil",
        "Lawful Evil", "Lawful Neutral", "Lawful Good",
        "Neutral Good", "Chaotic Good", "Neutral"];

    static SYSTEMS = ["pf1", "pf2", "5e"];

    static getDistanceFromCenter(event)
    {
        const image = event.currentTarget;
        const centerX = Math.floor(image.clientWidth / 2);
        const centerY = Math.floor(image.clientHeight / 2);

        const x = centerX - event.offsetX;
        const xx = x * x;

        const y = centerY - event.offsetY;
        const yy = y * y;

        return Math.floor(Math.sqrt(xx + yy));
    }

    static getIsValidClickArea(distanceFromCenter)
    {
        return distanceFromCenter < 168;
    }

    static getIsNeutralArea(distanceFromCenter)
    {
        return distanceFromCenter < 67;
    }

    static Dot2(vector1, vector2)
    {
        return (vector1[0] * vector2[0]) + (vector1[1] * vector2[1]);
    }

    static Length(vector1)
    {
        const dot = this.Dot2(vector1, vector1);
        return Math.sqrt(dot);
    }

    static Normalize(vector1)
    {
        const length = this.Length(vector1, vector1);
        return [vector1[0] / length, vector1[1] / length];
    }

    static getImageRegion(event)
    {
        const numPoints = 6;

        const center = [event.currentTarget.clientWidth / 2.0, event.currentTarget.clientHeight / 2.0];
        const angle = Math.atan2(event.offsetY - center[1], event.offsetX - center[0]) / this.PI * 180.0;
        const correctedAngle = angle < 0.0 ? 360.0 + angle : angle;

        const imgRegions = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
        for (let i = 0; i < imgRegions.length; ++i)
        {
            if (correctedAngle <= imgRegions[i])
            {
                return i;
            }
        }
        return 0;
    }
}

class AlignmentApplication extends Application
{
    constructor(actor, system, sheet)
    {
        super();

        this.actor = actor;
        this.system = AlignmentTracker.SYSTEMS[system];
        this.sheet = sheet;
    }

    static get defaultOptions()
    {
        const defaults = super.defaultOptions;

        const overrides =
        {
            height: '544',
            width: '544',
            id: 'Alignment',
            title: 'Alignment',
            template: AlignmentTracker.TEMPLATES.AlignmentTracker,
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        const image = html.find('img');
        image.click((event) =>
        {
            AlignmentTracker.log(false, event); //remove this on release

            const dist = AlignmentTracker.getDistanceFromCenter(event);
            const valid = AlignmentTracker.getIsValidClickArea(dist);
            AlignmentTracker.log(false, 'AlignmentTracker | Is valid click area: %s', valid);
            if (valid)
            {
                const pf1System = this.system == "pf1";
                const alignmentIndex = AlignmentTracker.getIsNeutralArea(dist) ? 8 : AlignmentTracker.getImageRegion(event);
                const alignment = pf1System ? AlignmentTracker.ALIGNMENTS[alignmentIndex] : AlignmentTracker.ALIGNMENTSLONG[alignmentIndex];
                if (pf1System)
                {
                    this.actor.update({ "data.details.alignment": alignment });
                }
                else
                {
                    this.sheet.document.update({ "data.details.alignment": alignment });
                }
            }
        });
    }

    getData()
    {
        return { image: AlignmentTracker.IMAGE.AlignmentWheel, actor: this.actor };
    }
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
}

function makeAlignmentSettingsButton(button, actor, system, sheet)
{
    button.addEventListener("click", event =>
    {
        AlignmentTracker.log(false, 'AlignmentTracker | Alignment settings button clicked, opening new window instead!');
        event.stopImmediatePropagation();
        let alignmentApplication = new AlignmentApplication(actor, system, sheet);

        alignmentApplication.render(true, { actor });
    }, true);
}

function alignmentSettingsPF1(sheet, jq, data)
{
    const actor = data.actor;
    if (!actor || !actor.isOwner)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid actor, or actor owner!');
        return;
    }

    const html = jq[0];
    const tab = html.querySelector(`.tab.summary`);
    if (!tab)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid summary tab!');
        return;
    }

    const alignmentButton = tab.querySelector(`.controls.alignment`)
    if (!alignmentButton)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid alignment button!');
        return;
    }

    makeAlignmentSettingsButton(alignmentButton, actor, 0, sheet);
}

function alignmentSettingsPF2(sheet, jq, data)
{
    const actor = data.actor;
    if (!actor)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid actor, or actor owner!');
        return;
    }

    const html = jq[0];

    const alignment = html.querySelector('select[name="data.details.alignment.value"]');
    if (!alignment)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid alignment button!');
        return;
    }

    const currentAlignment = actor.data.details.alignment == "" ? "Alignment" : actor.data.details.alignment;
    const alignmentButton = $(`<a title="Alignment Tracker"  style="display: block; height: 24px; line-height: 24px;"><i class="app window-app default sheet actor character"></i> ${currentAlignment}</a>`)[0];
    alignmentButton.textContent = currentAlignment;
    alignmentButton.title = 'Alignment Tracker';

    alignment.replaceWith(alignmentButton);

    makeAlignmentSettingsButton(alignmentButton, actor, 1, sheet);
}

function alignmentSettings5e(sheet, jq, data)
{
    AlignmentTracker.log(false, 'AlignmentTracker | 5e actor found!');

    const actor = data.actor;
    if (!actor)
    {
        AlignmentTracker.log(false, 'AlignmentTracker | No valid actor, or actor owner!');
        return;
    }

    const html = jq[0];
    const alignment = html.querySelector('input[name="data.details.alignment"]');
    if (!alignment)
    {
        console.log("AlignmentTracker | No valid alignment!");
        return;
    }

    const currentAlignment = actor.data.details.alignment == "" ? "Alignment" : actor.data.details.alignment;
    const alignmentButton = $(`<a title="Alignment Tracker" style="display: block; height: 24px; line-height: 24px;" ><i class="fas fa-exchange-alt"></i> ${currentAlignment}</a>`)[0];
    alignmentButton.textContent = currentAlignment;
    alignmentButton.title = 'Alignment Tracker';

    alignment.replaceWith(alignmentButton);

    makeAlignmentSettingsButton(alignmentButton, actor, 2, sheet);
}

Hooks.on('renderActorSheetPF', alignmentSettingsPF1);
Hooks.on('renderCharacterSheetPF2e', alignmentSettingsPF2);
Hooks.on('renderActorSheet5e', alignmentSettings5e);