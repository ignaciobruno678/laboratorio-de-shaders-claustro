/*{
    "CREDIT": "Claustro",
    "DESCRIPTION": "Procedural Fibonacci golden spiral with permanently continuous trim-path motion. The luminous segment never disappears: as the tail leaves the end, a new head is already entering from the beginning. Supports 1-12 radial mirrored copies, alternate handedness, phase offsets and two-color combinations.",
    "TAGS": "laser,fibonacci,golden,spiral,trim,continuous,mirror,symmetry,flow,color,claustro",
    "VSN": "1.2",

    "INPUTS": [

        {
            "LABEL": "Spiral/Turns",
            "NAME": "mat_turns",
            "TYPE": "float",
            "MIN": 0.5,
            "MAX": 8.0,
            "DEFAULT": 4.0
        },

        {
            "LABEL": "Spiral/Outer Radius",
            "NAME": "mat_outerRadius",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 1.0,
            "DEFAULT": 0.82
        },

        {
            "LABEL": "Spiral/Center Scale",
            "NAME": "mat_centerScale",
            "TYPE": "float",
            "MIN": 0.2,
            "MAX": 4.0,
            "DEFAULT": 1.0
        },

        {
            "LABEL": "Spiral/Direction",
            "NAME": "mat_direction",
            "TYPE": "long",
            "VALUES": [0,1],
            "LABELS": ["Clockwise","Counter Clockwise"],
            "DEFAULT": 0
        },

        {
            "LABEL": "Figure/Scale X",
            "NAME": "mat_scaleX",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 2.0,
            "DEFAULT": 1.0
        },

        {
            "LABEL": "Figure/Scale Y",
            "NAME": "mat_scaleY",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 2.0,
            "DEFAULT": 1.0
        },

        {
            "LABEL": "Figure/Rotation",
            "NAME": "mat_rotation",
            "TYPE": "float",
            "MIN": -360.0,
            "MAX": 360.0,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Mirror/Count",
            "NAME": "mat_mirrorCount",
            "TYPE": "long",
            "VALUES": [1,2,3,4,5,6,7,8,9,10,11,12],
            "LABELS": ["1","2","3","4","5","6","7","8","9","10","11","12"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Mirror/Mode",
            "NAME": "mat_mirrorMode",
            "TYPE": "long",
            "VALUES": [0,1],
            "LABELS": ["Radial Copies","Alternate Mirror"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Mirror/Spread",
            "NAME": "mat_mirrorSpread",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 2.0,
            "DEFAULT": 1.0
        },

        {
            "LABEL": "Mirror/Phase Offset",
            "NAME": "mat_mirrorPhase",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 1.0,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Flow/Segment Length",
            "NAME": "mat_trailLength",
            "TYPE": "float",
            "MIN": 0.02,
            "MAX": 1.0,
            "DEFAULT": 0.28
        },

        {
            "LABEL": "Flow/Offset",
            "NAME": "mat_offset",
            "TYPE": "float",
            "MIN": -4.0,
            "MAX": 4.0,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Flow/Travel Loops",
            "NAME": "mat_travelLoops",
            "TYPE": "long",
            "VALUES": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
            "LABELS": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Flow/Duration",
            "NAME": "mat_duration",
            "TYPE": "float",
            "MIN": 0.2,
            "MAX": 30.0,
            "DEFAULT": 5.0
        },

        {
            "LABEL": "Flow/Speed",
            "NAME": "mat_speed",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 5.0,
            "DEFAULT": 1.0
        },

        {
            "LABEL": "Flow/Ease",
            "NAME": "mat_easeStrength",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 1.0,
            "DEFAULT": 0.75
        },

        {
            "LABEL": "Flow/Acceleration Bias",
            "NAME": "mat_acceleration",
            "TYPE": "float",
            "MIN": -1.0,
            "MAX": 1.0,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Flow/Elastic Amount",
            "NAME": "mat_elasticAmount",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 0.5,
            "DEFAULT": 0.035
        },

        {
            "LABEL": "Flow/Elastic Frequency",
            "NAME": "mat_elasticFrequency",
            "TYPE": "float",
            "MIN": 0.5,
            "MAX": 8.0,
            "DEFAULT": 2.5
        },

        {
            "LABEL": "Flow/Elastic Damping",
            "NAME": "mat_elasticDamping",
            "TYPE": "float",
            "MIN": 1.0,
            "MAX": 12.0,
            "DEFAULT": 5.0
        },

        {
            "LABEL": "Flow/Head Softness",
            "NAME": "mat_headSoftness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 0.15,
            "DEFAULT": 0.015
        },

        {
            "LABEL": "Flow/Tail Softness",
            "NAME": "mat_tailSoftness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 0.20,
            "DEFAULT": 0.03
        },

        {
            "LABEL": "Geometry/Breath Amount",
            "NAME": "mat_breathAmount",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 0.4,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Geometry/Breath Cycles",
            "NAME": "mat_breathCycles",
            "TYPE": "long",
            "VALUES": [1,2,3,4,5,6,7,8],
            "LABELS": ["1","2","3","4","5","6","7","8"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Geometry/Auto Rotation",
            "NAME": "mat_rotationCycles",
            "TYPE": "long",
            "VALUES": [-4,-3,-2,-1,0,1,2,3,4],
            "LABELS": ["-4","-3","-2","-1","0","1","2","3","4"],
            "DEFAULT": 0
        },

        {
            "LABEL": "Geometry/Wave Amount",
            "NAME": "mat_waveAmount",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 0.25,
            "DEFAULT": 0.0
        },

        {
            "LABEL": "Geometry/Wave Frequency",
            "NAME": "mat_waveFrequency",
            "TYPE": "float",
            "MIN": 1.0,
            "MAX": 20.0,
            "DEFAULT": 6.0
        },

        {
            "LABEL": "Geometry/Wave Speed",
            "NAME": "mat_waveCycles",
            "TYPE": "long",
            "VALUES": [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8],
            "LABELS": ["-8","-7","-6","-5","-4","-3","-2","-1","0","1","2","3","4","5","6","7","8"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Color/Mode",
            "NAME": "mat_colorMode",
            "TYPE": "long",
            "VALUES": [0,1,2,3,4],
            "LABELS": [
                "Trail Gradient",
                "Spiral Gradient",
                "Alternate Mirrors",
                "Animated Gradient",
                "Hard Split"
            ],
            "DEFAULT": 0
        },

        {
            "LABEL": "Color/A",
            "NAME": "mat_colorA",
            "TYPE": "color",
            "DEFAULT": [1.0,0.05,0.15,1.0],
            "FLAGS": ["no_alpha"]
        },

        {
            "LABEL": "Color/B",
            "NAME": "mat_colorB",
            "TYPE": "color",
            "DEFAULT": [0.05,0.35,1.0,1.0],
            "FLAGS": ["no_alpha"]
        },

        {
            "LABEL": "Color/Position",
            "NAME": "mat_colorPosition",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 1.0,
            "DEFAULT": 0.5
        },

        {
            "LABEL": "Color/Softness",
            "NAME": "mat_colorSoftness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 1.0,
            "DEFAULT": 0.35
        },

        {
            "LABEL": "Color/Animation Cycles",
            "NAME": "mat_colorCycles",
            "TYPE": "long",
            "VALUES": [-4,-3,-2,-1,0,1,2,3,4],
            "LABELS": ["-4","-3","-2","-1","0","1","2","3","4"],
            "DEFAULT": 1
        },

        {
            "LABEL": "Brightness",
            "NAME": "mat_brightness",
            "TYPE": "float",
            "MIN": 0.0,
            "MAX": 2.0,
            "DEFAULT": 1.0
        }

    ],

    "GENERATORS": [

        {
            "NAME": "mat_time",
            "TYPE": "time_base",
            "PARAMS": {
                "speed": "mat_speed",
                "speed_curve": 1,
                "link_speed_to_global_bpm": false
            }
        }

    ],

    "RENDER_SETTINGS": {
        "POINT_COUNT": 3600
    }

}*/


#define MAX_MIRRORS 12
#define POINTS_PER_MIRROR 300

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692
#define PHI 1.61803398874989484820


float sat(float x)
{
    return clamp(x,0.0,1.0);
}


float smoother(float x)
{
    x = sat(x);

    return
        x*x*x*
        (
            x*
            (
                x*6.0-15.0
            )
            +10.0
        );
}


vec2 rotate2D(
    vec2 p,
    float angle
)
{
    float c = cos(angle);
    float s = sin(angle);

    return vec2(
        c*p.x-s*p.y,
        s*p.x+c*p.y
    );
}


/* =========================================================
   GLOBAL PHASE
   ========================================================= */

float getCyclePhase()
{
    return fract(
        mat_time /
        max(
            mat_duration,
            0.001
        )
    );
}


/* =========================================================
   FLUID MOTION
   ========================================================= */

float getMotionProgress()
{
    float x =
        getCyclePhase();


    float eased =
        mix(
            x,
            smoother(x),
            mat_easeStrength
        );


    if(mat_acceleration > 0.001)
    {
        float amount =
            mat_acceleration;

        float exponent =
            mix(
                1.0,
                3.5,
                amount
            );

        float accelerated =
            pow(
                x,
                exponent
            );

        eased =
            mix(
                eased,
                accelerated,
                amount
            );
    }
    else if(mat_acceleration < -0.001)
    {
        float amount =
            abs(
                mat_acceleration
            );

        float exponent =
            mix(
                1.0,
                3.5,
                amount
            );

        float decelerated =
            1.0 -
            pow(
                1.0-x,
                exponent
            );

        eased =
            mix(
                eased,
                decelerated,
                amount
            );
    }


    float spring =
        sin(
            x *
            PI *
            mat_elasticFrequency
        );


    spring *=
        exp(
            -x *
            mat_elasticDamping
        );


    spring *=
        sin(
            x*PI
        );


    eased +=
        spring *
        mat_elasticAmount *
        0.10;


    return eased;
}


/* =========================================================
   GOLDEN SPIRAL
   ========================================================= */

float getGoldenRadius(float u)
{
    float turns =
        max(
            mat_turns,
            0.001
        );


    float exponentRange =
        4.0 *
        turns;


    float innerRadius =
        mat_outerRadius /
        pow(
            PHI,
            exponentRange
        );


    innerRadius *=
        mat_centerScale;


    float radius =
        innerRadius *
        pow(
            PHI,
            exponentRange*u
        );


    return min(
        radius,
        mat_outerRadius
    );
}


/* =========================================================
   BREATH
   ========================================================= */

float getBreath()
{
    if(mat_breathAmount <= 0.000001)
    {
        return 1.0;
    }


    float phase =
        getCyclePhase();


    float wave =
        0.5 -
        0.5 *
        cos(
            phase *
            TWO_PI *
            float(
                mat_breathCycles
            )
        );


    return
        1.0 +
        wave *
        mat_breathAmount;
}


/* =========================================================
   GEOMETRIC WAVE
   ========================================================= */

float getWave(float u)
{
    if(mat_waveAmount <= 0.000001)
    {
        return 1.0;
    }


    float temporal =
        getCyclePhase() *
        TWO_PI *
        float(
            mat_waveCycles
        );


    float spatial =
        u *
        TWO_PI *
        mat_waveFrequency;


    return
        1.0 +
        sin(
            spatial -
            temporal
        ) *
        mat_waveAmount;
}


/* =========================================================
   SPIRAL
   ========================================================= */

vec2 getSpiralPoint(
    float u,
    int mirrorIndex
)
{
    float direction =
        mat_direction == 0
        ?
        1.0
        :
        -1.0;


    float angle =
        direction *
        u *
        TWO_PI *
        mat_turns;


    float radius =
        getGoldenRadius(u);


    radius *=
        getWave(u);


    vec2 p =
        vec2(
            cos(angle),
            sin(angle)
        ) *
        radius;


    /*
        Alternate true mirror handedness.
    */

    if(
        mat_mirrorMode == 1 &&
        (mirrorIndex%2)==1
    )
    {
        p.x =
            -p.x;
    }


    p *=
        getBreath();


    p *=
        vec2(
            mat_scaleX,
            mat_scaleY
        );


    float globalRotation =
        radians(
            mat_rotation
        );


    globalRotation +=
        getCyclePhase() *
        TWO_PI *
        float(
            mat_rotationCycles
        );


    p =
        rotate2D(
            p,
            globalRotation
        );


    /*
        Radial distribution of copies.
    */

    int count =
        clamp(
            mat_mirrorCount,
            1,
            MAX_MIRRORS
        );


    float radialAngle =
        TWO_PI *
        float(mirrorIndex) /
        float(count);


    radialAngle *=
        mat_mirrorSpread;


    p =
        rotate2D(
            p,
            radialAngle
        );


    return p;
}


/* =========================================================
   CONTINUOUS CYCLIC TRIM

   This is the important part:

   There is ALWAYS a segment visible.

   When the head reaches the end of the open spiral,
   the segment wraps.

   Part of the old segment remains at the outer end
   while a new part is already appearing from the center.

   There is therefore no temporal blackout.
   ========================================================= */

float getCyclicTrail(
    float pathT,
    float head,
    out float trailPosition
)
{
    float length =
        clamp(
            mat_trailLength,
            0.02,
            1.0
        );


    /*
        Circular distance behind the head.

        0 = head
        length = tail
    */

    float distanceBehind =
        fract(
            head -
            pathT +
            1.0
        );


    if(distanceBehind > length)
    {
        trailPosition = 0.0;
        return 0.0;
    }


    /*
        trailPosition:
        0 = tail
        1 = head
    */

    trailPosition =
        1.0 -
        distanceBehind /
        length;


    float headSoft =
        min(
            mat_headSoftness,
            length*0.48
        );


    float tailSoft =
        min(
            mat_tailSoftness,
            length*0.48
        );


    headSoft =
        max(
            headSoft,
            0.0001
        );


    tailSoft =
        max(
            tailSoft,
            0.0001
        );


    /*
        Convert softness from global path units
        to local trail units.
    */

    float headLocal =
        headSoft /
        length;


    float tailLocal =
        tailSoft /
        length;


    float tailFade =
        smoothstep(
            0.0,
            tailLocal,
            trailPosition
        );


    float headFade =
        1.0 -
        smoothstep(
            1.0-headLocal,
            1.0,
            trailPosition
        );


    /*
        Avoid complete darkness at tiny trail lengths.
    */

    float core =
        max(
            tailFade *
            headFade,
            0.01
        );


    return core;
}


/* =========================================================
   TWO COLORS
   ========================================================= */

vec3 getColor(
    float pathT,
    float trailPosition,
    int mirrorIndex
)
{
    float amount =
        0.0;


    /*
        Tail -> Head gradient.
    */

    if(mat_colorMode == 0)
    {
        amount =
            smoother(
                trailPosition
            );
    }


    /*
        Center -> outside.
    */

    else if(mat_colorMode == 1)
    {
        float softness =
            max(
                mat_colorSoftness,
                0.001
            );


        amount =
            smoothstep(
                mat_colorPosition-softness,
                mat_colorPosition+softness,
                pathT
            );
    }


    /*
        Alternate mirrored spirals.
    */

    else if(mat_colorMode == 2)
    {
        amount =
            (mirrorIndex%2)==0
            ?
            0.0
            :
            1.0;
    }


    /*
        Animated color flowing along spiral.
    */

    else if(mat_colorMode == 3)
    {
        float phase =
            pathT *
            TWO_PI;


        phase -=
            getCyclePhase() *
            TWO_PI *
            float(
                mat_colorCycles
            );


        amount =
            0.5 +
            0.5 *
            sin(
                phase
            );


        amount =
            smoother(
                amount
            );
    }


    /*
        Hard split.
    */

    else
    {
        amount =
            pathT <
            mat_colorPosition
            ?
            0.0
            :
            1.0;
    }


    return
        mix(
            mat_colorA.rgb,
            mat_colorB.rgb,
            sat(amount)
        );
}


/* =========================================================
   LASER MATERIAL
   ========================================================= */

void laserMaterialFunc(
    int pointNumber,
    int pointCount,

    out vec2 pos,
    out vec4 color,
    out int shapeNumber,
    out vec4 userData
)
{
    int mirrorIndex =
        pointNumber /
        POINTS_PER_MIRROR;


    int pointInMirror =
        pointNumber -
        mirrorIndex *
        POINTS_PER_MIRROR;


    int mirrorCount =
        clamp(
            mat_mirrorCount,
            1,
            MAX_MIRRORS
        );


    if(mirrorIndex >= mirrorCount)
    {
        pos =
            vec2(0.0);

        color =
            vec4(0.0);

        shapeNumber =
            -1;

        userData =
            vec4(0.0);

        return;
    }


    float pathT =
        float(pointInMirror) /
        float(
            POINTS_PER_MIRROR-1
        );


    pos =
        getSpiralPoint(
            pathT,
            mirrorIndex
        );


    float motion =
        getMotionProgress();


    /*
        Integer travel count guarantees exact loop closure.
    */

    float head =
        mat_offset +
        motion *
        float(
            mat_travelLoops
        );


    /*
        Optional phase displacement between mirrored copies.
    */

    head +=
        float(mirrorIndex) *
        mat_mirrorPhase;


    head =
        fract(
            head
        );


    float trailPosition;


    float brightness =
        getCyclicTrail(
            pathT,
            head,
            trailPosition
        );


    brightness *=
        mat_brightness;


    vec3 finalColor =
        getColor(
            pathT,
            trailPosition,
            mirrorIndex
        );


    color =
        vec4(
            finalColor *
            brightness,
            1.0
        );


    shapeNumber =
        mirrorIndex;


    userData =
        vec4(
            pathT,
            trailPosition,
            head,
            brightness
        );
}