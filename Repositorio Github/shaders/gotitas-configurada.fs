/*{
    "CREDIT": "c.l.a.u.s.t.r.o",
    "DESCRIPTION": "Small cross-shaped starbursts for laser. Up to 12 stars arranged in unique spatial cells so they do not overlap. Each star starts from the center and extends to 4 tips while the tail trims outward. Includes bottom-to-top sweep reveal and progressive alignment into a large circle, then back to original positions by animating the parameters.",
    "TAGS": "laser,stars,cross,trim,sequence,rotation,grid,circle,sweep,gotitas",
    "VSN": "1.3",
    "INPUTS": [
        {
            "LABEL": "Stars/Count",
            "NAME": "mat_starCount",
            "TYPE": "long",
            "VALUES": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
            ],
            "LABELS": [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12"
            ],
            "DEFAULT": 6
        },
        {
            "LABEL": "Stars/Base Size",
            "NAME": "mat_size",
            "TYPE": "float",
            "MIN": 0.01,
            "MAX": 0.22,
            "DEFAULT": 0.065
        },
        {
            "LABEL": "Stars/Size Randomness",
            "NAME": "mat_sizeRandomness",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 0.7,
            "DEFAULT": 0.18
        },
        {
            "LABEL": "Layout/Spread X",
            "NAME": "mat_spreadX",
            "TYPE": "float",
            "MIN": 0.2,
            "MAX": 1.2,
            "DEFAULT": 0.9
        },
        {
            "LABEL": "Layout/Spread Y",
            "NAME": "mat_spreadY",
            "TYPE": "float",
            "MIN": 0.2,
            "MAX": 1.2,
            "DEFAULT": 0.82
        },
        {
            "LABEL": "Layout/Cell Jitter",
            "NAME": "mat_positionJitter",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 0.12,
            "DEFAULT": 0.025
        },
        {
            "LABEL": "Layout/Seed",
            "NAME": "mat_seed",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 100,
            "DEFAULT": 11
        },
        {
            "LABEL": "Animation/Duration",
            "NAME": "mat_duration",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 10,
            "DEFAULT": 1.5
        },
        {
            "LABEL": "Animation/Trail Length",
            "NAME": "mat_trail",
            "TYPE": "float",
            "MIN": 0.02,
            "MAX": 1,
            "DEFAULT": 0.35
        },
        {
            "LABEL": "Animation/Stagger",
            "NAME": "mat_stagger",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0.65
        },
        {
            "LABEL": "Animation/Speed",
            "NAME": "mat_speed",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 5,
            "DEFAULT": 1
        },
        {
            "LABEL": "Animation/Smoothness",
            "NAME": "mat_smoothness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 0.25,
            "DEFAULT": 0.04
        },
        {
            "LABEL": "Rotation/Degrees",
            "NAME": "mat_rotationDegrees",
            "TYPE": "float",
            "MIN": -360,
            "MAX": 360,
            "DEFAULT": 90
        },
        {
            "LABEL": "Rotation/Speed",
            "NAME": "mat_rotationSpeed",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 5,
            "DEFAULT": 1
        },
        {
            "LABEL": "Sweep/Bottom To Top",
            "NAME": "mat_verticalSweep",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 1
        },
        {
            "LABEL": "Sweep/Softness",
            "NAME": "mat_sweepSoftness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 0.25,
            "DEFAULT": 0.06
        },
        {
            "LABEL": "Circle/Formation",
            "NAME": "mat_circleFormation",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0
        },
        {
            "LABEL": "Circle/Radius",
            "NAME": "mat_circleRadius",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 1.2,
            "DEFAULT": 0.65
        },
        {
            "LABEL": "Circle/Rotation",
            "NAME": "mat_circleRotation",
            "TYPE": "float",
            "MIN": -360,
            "MAX": 360,
            "DEFAULT": 0
        },
        {
            "LABEL": "Motion/Drift Amount",
            "NAME": "mat_driftAmount",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 0.08,
            "DEFAULT": 0
        },
        {
            "LABEL": "Motion/Drift Speed",
            "NAME": "mat_driftSpeed",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 10,
            "DEFAULT": 1
        },
        {
            "LABEL": "Color",
            "NAME": "mat_color",
            "TYPE": "color",
            "DEFAULT": [
                1,
                1,
                1,
                1
            ],
            "FLAGS": [
                "no_alpha"
            ]
        },
        {
            "LABEL": "Brightness",
            "NAME": "mat_brightness",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 2,
            "DEFAULT": 0.7
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
        },
        {
            "NAME": "mat_driftTime",
            "TYPE": "time_base",
            "PARAMS": {
                "speed": "mat_driftSpeed",
                "speed_curve": 1,
                "link_speed_to_global_bpm": false
            }
        }
    ],
    "RENDER_SETTINGS": {
        "POINT_COUNT": 2160
    }
}*/


#define MAX_STARS 12
#define ARMS_PER_STAR 4
#define POINTS_PER_ARM 45
#define POINTS_PER_STAR 180

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692


float sat(float v)
{
    return clamp(v,0.0,1.0);
}


float hash11(float p)
{
    return fract(
        sin(p*127.1 + 311.7) *
        43758.5453123
    );
}


float signedHash(float p)
{
    return hash11(p)*2.0 - 1.0;
}


float easeSmooth(float x)
{
    x = sat(x);

    return
        x*x*(3.0-2.0*x);
}


vec2 rotate2D(
    vec2 p,
    float a
)
{
    float c = cos(a);
    float s = sin(a);

    return vec2(
        c*p.x - s*p.y,
        s*p.x + c*p.y
    );
}


/* =========================================================
   STAR COUNT
   ========================================================= */

int getStarCountInt()
{
    return
        clamp(
            mat_starCount,
            1,
            MAX_STARS
        );
}


/* =========================================================
   STAR ARMS
   ========================================================= */

vec2 getArmDirection(
    int armIndex
)
{
    if (armIndex == 0)
    {
        return vec2(0.0,1.0);
    }

    if (armIndex == 1)
    {
        return vec2(1.0,0.0);
    }

    if (armIndex == 2)
    {
        return vec2(0.0,-1.0);
    }

    return vec2(-1.0,0.0);
}


/* =========================================================
   SAFE GRID
   ========================================================= */

int positiveMod12(
    int value
)
{
    int v =
        value % 12;

    if (v < 0)
    {
        v += 12;
    }

    return v;
}


int getCellForStar(
    int starIndex
)
{
    int offset =
        int(
            floor(
                mat_seed*3.0
            )
        );

    return
        positiveMod12(
            offset +
            starIndex*5
        );
}


vec2 getCellPosition(
    int cell
)
{
    int column =
        cell % 4;

    int row =
        cell / 4;


    float x =
        -0.75 +
        float(column)*0.50;


    float y;

    if (row == 0)
    {
        y = 0.68;
    }
    else if (row == 1)
    {
        y = 0.0;
    }
    else
    {
        y = -0.68;
    }


    return
        vec2(
            x*mat_spreadX,
            y*mat_spreadY
        );
}


vec2 getCellJitter(
    int starIndex
)
{
    float seed =
        mat_seed*17.71 +
        float(starIndex)*37.13;

    return
        vec2(
            signedHash(seed+1.0),
            signedHash(seed+2.0)
        ) *
        mat_positionJitter;
}


vec2 getGridCenter(
    int starIndex
)
{
    int cell =
        getCellForStar(
            starIndex
        );

    return
        getCellPosition(cell) +
        getCellJitter(
            starIndex
        );
}


/* =========================================================
   BIG CIRCLE TARGET
   Animate mat_circleFormation from 0 -> 1 -> 0
   to gather the stars into a big circle and return.
   ========================================================= */

vec2 getCircleCenter(
    int starIndex,
    int starCount
)
{
    float countValue =
        float(
            max(
                starCount,
                1
            )
        );

    float angle =
        TWO_PI *
        float(starIndex) /
        countValue;

    angle +=
        radians(
            mat_circleRotation - 90.0
        );

    return
        vec2(
            cos(angle),
            sin(angle)
        ) *
        mat_circleRadius;
}


vec2 getStarBaseCenter(
    int starIndex,
    int starCount
)
{
    vec2 gridCenter =
        getGridCenter(
            starIndex
        );

    vec2 circleCenter =
        getCircleCenter(
            starIndex,
            starCount
        );

    return
        mix(
            gridCenter,
            circleCenter,
            sat(mat_circleFormation)
        );
}


/* =========================================================
   SIZE
   ========================================================= */

float getStarScale(
    int starIndex
)
{
    float seed =
        mat_seed*13.0 +
        float(starIndex)*19.3;

    float r =
        hash11(seed+4.0);

    float minScale =
        1.0 -
        mat_sizeRandomness*0.4;

    float maxScale =
        1.0 +
        mat_sizeRandomness*0.5;

    return
        mat_size *
        mix(
            minScale,
            maxScale,
            r
        );
}


/* =========================================================
   PHASE
   ========================================================= */

float getStarPhase(
    int starIndex
)
{
    float duration =
        max(
            mat_duration,
            0.001
        );

    float offset =
        mat_stagger *
        float(starIndex) /
        float(MAX_STARS);

    float p =
        fract(
            mat_time /
            duration +
            offset
        );

    return
        easeSmooth(p);
}


/* =========================================================
   ROTATION
   ========================================================= */

float getStarRotation(
    int starIndex
)
{
    float phase =
        getStarPhase(
            starIndex
        );

    float rotationPhase =
        sat(
            phase *
            mat_rotationSpeed
        );

    rotationPhase =
        easeSmooth(
            rotationPhase
        );

    return
        radians(
            mat_rotationDegrees
        ) *
        rotationPhase;
}


/* =========================================================
   DRIFT
   ========================================================= */

vec2 getDriftOffset(
    int starIndex
)
{
    if (
        mat_driftAmount <=
        0.00001
    )
    {
        return vec2(0.0);
    }

    float seed =
        mat_seed +
        float(starIndex)*7.31;

    float phase =
        getStarPhase(
            starIndex
        );

    float envelope =
        sin(
            phase*PI
        );

    float tx =
        mat_driftTime*TWO_PI +
        seed;

    float ty =
        mat_driftTime*TWO_PI*0.73 +
        seed*1.71;

    return
        vec2(
            sin(tx),
            cos(ty)
        ) *
        mat_driftAmount *
        envelope;
}


/* =========================================================
   TRIM PATH
   ========================================================= */

float getPointBrightness(
    float armT,
    float phase
)
{
    float trail =
        clamp(
            mat_trail,
            0.001,
            1.0
        );

    float head =
        phase *
        (
            1.0 +
            trail
        );

    float tail =
        head -
        trail;

    head =
        clamp(
            head,
            0.0,
            1.0
        );

    tail =
        clamp(
            tail,
            0.0,
            1.0
        );

    if (
        armT < tail ||
        armT > head
    )
    {
        return 0.0;
    }

    float softness =
        min(
            mat_smoothness,
            trail*0.49
        );

    softness =
        max(
            softness,
            0.0001
        );

    float fadeIn =
        smoothstep(
            tail,
            tail+softness,
            armT
        );

    float fadeOut =
        1.0 -
        smoothstep(
            head-softness,
            head,
            armT
        );

    return
        fadeIn *
        fadeOut;
}


/* =========================================================
   BOTTOM TO TOP SWEEP
   Animate mat_verticalSweep from 0 -> 1.
   0 = hidden
   1 = fully revealed
   ========================================================= */

float getSweepBrightness(
    vec2 worldPos
)
{
    float normalizedY =
        clamp(
            (worldPos.y + 1.0) * 0.5,
            0.0,
            1.0
        );

    float softness =
        max(
            mat_sweepSoftness,
            0.0001
        );

    float threshold =
        mix(
            -softness,
            1.0 + softness,
            sat(mat_verticalSweep)
        );

    return
        1.0 -
        smoothstep(
            threshold - softness,
            threshold + softness,
            normalizedY
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
    int starIndex =
        pointNumber /
        POINTS_PER_STAR;


    int pointInStar =
        pointNumber -
        starIndex*
        POINTS_PER_STAR;


    int armIndex =
        pointInStar /
        POINTS_PER_ARM;


    int pointInArm =
        pointInStar -
        armIndex*
        POINTS_PER_ARM;


    float armT =
        float(pointInArm) /
        float(
            POINTS_PER_ARM-1
        );


    int activeStars =
        getStarCountInt();


    if (
        starIndex >=
        activeStars
    )
    {
        pos = vec2(0.0);
        color = vec4(0.0);
        shapeNumber = -1;
        userData = vec4(0.0);
        return;
    }


    vec2 center =
        getStarBaseCenter(
            starIndex,
            activeStars
        );


    center +=
        getDriftOffset(
            starIndex
        );


    float scale =
        getStarScale(
            starIndex
        );


    vec2 direction =
        getArmDirection(
            armIndex
        );


    float rotation =
        getStarRotation(
            starIndex
        );


    vec2 localPosition =
        direction *
        armT *
        scale;


    localPosition =
        rotate2D(
            localPosition,
            rotation
        );


    pos =
        center +
        localPosition;


    float phase =
        getStarPhase(
            starIndex
        );


    float brightness =
        getPointBrightness(
            armT,
            phase
        );


    brightness *=
        getSweepBrightness(
            pos
        );

    brightness *=
        mat_brightness;


    color =
        vec4(
            mat_color.rgb *
            brightness,
            1.0
        );


    shapeNumber =
        starIndex*8 +
        armIndex;


    userData =
        vec4(
            armT,
            phase,
            rotation,
            brightness
        );
}