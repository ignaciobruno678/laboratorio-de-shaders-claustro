/*{
    "CREDIT": "c.l.a.u.s.t.r.o",
    "DESCRIPTION": "Laser curve system with seamless integer trim travel. Includes organic loops and cross forms. Choose one or two colors and superimpose multiple figures.",
    "TAGS": "laser,curve,trim,organic,cross,overlap,curvas",
    "VSN": "1.4",
    "INPUTS": [
        {
            "LABEL": "Figure/Family",
            "NAME": "mat_family",
            "TYPE": "long",
            "VALUES": [
                0,
                1
            ],
            "LABELS": [
                "Organic",
                "Cross"
            ],
            "DEFAULT": 0
        },
        {
            "LABEL": "Figure/Count",
            "NAME": "mat_figureCount",
            "TYPE": "long",
            "VALUES": [
                1,
                2,
                3,
                4
            ],
            "LABELS": [
                "1",
                "2",
                "3",
                "4"
            ],
            "DEFAULT": 1
        },
        {
            "LABEL": "Figure/Size",
            "NAME": "mat_size",
            "TYPE": "float",
            "MIN": 0.05,
            "MAX": 1,
            "DEFAULT": 0.65
        },
        {
            "LABEL": "Figure/Scale X",
            "NAME": "mat_scaleX",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 2,
            "DEFAULT": 1
        },
        {
            "LABEL": "Figure/Scale Y",
            "NAME": "mat_scaleY",
            "TYPE": "float",
            "MIN": 0.1,
            "MAX": 2,
            "DEFAULT": 1
        },
        {
            "LABEL": "Figure/Rotation",
            "NAME": "mat_rotation",
            "TYPE": "float",
            "MIN": -360,
            "MAX": 360,
            "DEFAULT": 0
        },
        {
            "LABEL": "Overlap/Rotation Step",
            "NAME": "mat_layerRotation",
            "TYPE": "float",
            "MIN": -180,
            "MAX": 180,
            "DEFAULT": 20
        },
        {
            "LABEL": "Overlap/Scale Step",
            "NAME": "mat_layerScaleStep",
            "TYPE": "float",
            "MIN": -0.3,
            "MAX": 0.5,
            "DEFAULT": 0.08
        },
        {
            "LABEL": "Overlap/Trim Phase",
            "NAME": "mat_layerTrimPhase",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0.08
        },
        {
            "LABEL": "Trim/Start",
            "NAME": "mat_start",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0
        },
        {
            "LABEL": "Trim/End",
            "NAME": "mat_end",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0.2
        },
        {
            "LABEL": "Trim/Offset",
            "NAME": "mat_offset",
            "TYPE": "float",
            "MIN": -4,
            "MAX": 4,
            "DEFAULT": 0
        },
        {
            "LABEL": "Trim/Auto Travel Loops",
            "NAME": "mat_autoTravelLoops",
            "TYPE": "long",
            "VALUES": [
                0,
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
                12,
                13,
                14,
                15,
                16
            ],
            "LABELS": [
                "0",
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
                "12",
                "13",
                "14",
                "15",
                "16"
            ],
            "DEFAULT": 1
        },
        {
            "LABEL": "Trim/Softness",
            "NAME": "mat_trimSoftness",
            "TYPE": "float",
            "MIN": 0.001,
            "MAX": 0.2,
            "DEFAULT": 0.025
        },
        {
            "LABEL": "Motion/Duration",
            "NAME": "mat_duration",
            "TYPE": "float",
            "MIN": 0.2,
            "MAX": 30,
            "DEFAULT": 6
        },
        {
            "LABEL": "Motion/Speed",
            "NAME": "mat_speed",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 5,
            "DEFAULT": 1
        },
        {
            "LABEL": "Motion/Ease Strength",
            "NAME": "mat_easeStrength",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 1
        },
        {
            "LABEL": "Motion/Elastic Amount",
            "NAME": "mat_elasticAmount",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1,
            "DEFAULT": 0.1
        },
        {
            "LABEL": "Motion/Elastic Frequency",
            "NAME": "mat_elasticFrequency",
            "TYPE": "float",
            "MIN": 0.5,
            "MAX": 8,
            "DEFAULT": 2.5
        },
        {
            "LABEL": "Motion/Elastic Damping",
            "NAME": "mat_elasticDamping",
            "TYPE": "float",
            "MIN": 1,
            "MAX": 12,
            "DEFAULT": 5
        },
        {
            "LABEL": "Organic/Frequency 1",
            "NAME": "mat_orgFreq1",
            "TYPE": "float",
            "MIN": 1,
            "MAX": 12,
            "DEFAULT": 3
        },
        {
            "LABEL": "Organic/Frequency 2",
            "NAME": "mat_orgFreq2",
            "TYPE": "float",
            "MIN": 1,
            "MAX": 16,
            "DEFAULT": 5
        },
        {
            "LABEL": "Organic/Amplitude 1",
            "NAME": "mat_orgAmp1",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 0.5,
            "DEFAULT": 0.18
        },
        {
            "LABEL": "Organic/Amplitude 2",
            "NAME": "mat_orgAmp2",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 0.5,
            "DEFAULT": 0.1
        },
        {
            "LABEL": "Organic/Skew X",
            "NAME": "mat_orgSkewX",
            "TYPE": "float",
            "MIN": -1,
            "MAX": 1,
            "DEFAULT": 0.2
        },
        {
            "LABEL": "Organic/Skew Y",
            "NAME": "mat_orgSkewY",
            "TYPE": "float",
            "MIN": -1,
            "MAX": 1,
            "DEFAULT": 0.1
        },
        {
            "LABEL": "Organic/Twist",
            "NAME": "mat_orgTwist",
            "TYPE": "float",
            "MIN": 0,
            "MAX": 1.5,
            "DEFAULT": 0.35
        },
        {
            "LABEL": "Color/Mode",
            "NAME": "mat_colorMode",
            "TYPE": "long",
            "VALUES": [
                0,
                1
            ],
            "LABELS": [
                "One Color",
                "Two Colors"
            ],
            "DEFAULT": 0
        },
        {
            "LABEL": "Color/Color 1",
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
            "LABEL": "Color/Color 2",
            "NAME": "mat_color2",
            "TYPE": "color",
            "DEFAULT": [
                0.545098,
                0.360784,
                0.964706,
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
        }
    ],
    "RENDER_SETTINGS": {
        "POINT_COUNT": 2400
    }
}*/


#define MAX_FIGURES 4
#define POINTS_PER_FIGURE 600

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530717958647692


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
                x*6.0 - 15.0
            )
            + 10.0
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
        c*p.x - s*p.y,
        s*p.x + c*p.y
    );
}


vec2 linePoint(
    vec2 a,
    vec2 b,
    float t
)
{
    return mix(a,b,sat(t));
}


vec2 quadraticBezier(
    vec2 a,
    vec2 b,
    vec2 c,
    float t
)
{
    float u = 1.0-t;

    return
        u*u*a +
        2.0*u*t*b +
        t*t*c;
}


/* =========================================================
   ORGANIC
   ========================================================= */

vec2 getOrganicShape(float t)
{
    float a =
        t*TWO_PI;

    float distortedAngle =
        a +
        mat_orgTwist *
        0.55 *
        sin(
            2.0*a
        );

    float r =
        0.72 +
        mat_orgAmp1 *
        sin(
            mat_orgFreq1 *
            distortedAngle
        ) +
        mat_orgAmp2 *
        cos(
            mat_orgFreq2 *
            distortedAngle +
            0.8
        );

    vec2 p =
        vec2(
            cos(distortedAngle),
            sin(distortedAngle)
        ) *
        r;

    p.x +=
        mat_orgSkewX *
        0.22 *
        sin(
            2.0*a
        );

    p.y +=
        mat_orgSkewY *
        0.22 *
        cos(
            3.0*a
        );

    return p;
}


/* =========================================================
   RIGHT ANGLE CROSS
   ========================================================= */

vec2 greekCrossVertex(
    int index,
    float horizontalLength,
    float verticalLength,
    float width
)
{
    float hx =
        horizontalLength;

    float vy =
        verticalLength;

    float w =
        width;


    if(index == 0)  return vec2(-w, vy);
    if(index == 1)  return vec2( w, vy);
    if(index == 2)  return vec2( w, w);
    if(index == 3)  return vec2( hx, w);
    if(index == 4)  return vec2( hx,-w);
    if(index == 5)  return vec2( w,-w);
    if(index == 6)  return vec2( w,-vy);
    if(index == 7)  return vec2(-w,-vy);
    if(index == 8)  return vec2(-w,-w);
    if(index == 9)  return vec2(-hx,-w);
    if(index == 10) return vec2(-hx, w);

    return vec2(-w,w);
}


vec2 getGreekCross(
    float t,
    float horizontalLength,
    float verticalLength,
    float width
)
{
    float segmentValue =
        t*12.0;

    int segment =
        int(
            floor(segmentValue)
        );

    if(segment >= 12)
    {
        segment = 11;
    }

    float localT =
        fract(segmentValue);

    vec2 a =
        greekCrossVertex(
            segment,
            horizontalLength,
            verticalLength,
            width
        );

    vec2 b =
        greekCrossVertex(
            (segment+1)%12,
            horizontalLength,
            verticalLength,
            width
        );

    return
        linePoint(
            a,
            b,
            localT
        );
}


/* =========================================================
   STEPPED CROSS
   ========================================================= */

vec2 steppedCrossVertex(
    int index,
    float horizontalLength,
    float verticalLength,
    float width,
    float stepSize
)
{
    float hx =
        horizontalLength;

    float vy =
        verticalLength;

    float w =
        width;

    float s =
        min(
            stepSize,
            min(hx,vy)*0.45
        );


    if(index == 0)  return vec2(-w,vy);
    if(index == 1)  return vec2( w,vy);
    if(index == 2)  return vec2( w,vy-s);
    if(index == 3)  return vec2( w+s,vy-s);
    if(index == 4)  return vec2( w+s,w+s);
    if(index == 5)  return vec2( hx-s,w+s);
    if(index == 6)  return vec2( hx-s,w);
    if(index == 7)  return vec2( hx,w);
    if(index == 8)  return vec2( hx,-w);
    if(index == 9)  return vec2( hx-s,-w);
    if(index == 10) return vec2( hx-s,-w-s);
    if(index == 11) return vec2( w+s,-w-s);
    if(index == 12) return vec2( w+s,-vy+s);
    if(index == 13) return vec2( w,-vy+s);
    if(index == 14) return vec2( w,-vy);
    if(index == 15) return vec2(-w,-vy);
    if(index == 16) return vec2(-w,-vy+s);
    if(index == 17) return vec2(-w-s,-vy+s);
    if(index == 18) return vec2(-w-s,-w-s);
    if(index == 19) return vec2(-hx+s,-w-s);
    if(index == 20) return vec2(-hx+s,-w);
    if(index == 21) return vec2(-hx,-w);
    if(index == 22) return vec2(-hx,w);
    if(index == 23) return vec2(-hx+s,w);
    if(index == 24) return vec2(-hx+s,w+s);
    if(index == 25) return vec2(-w-s,w+s);
    if(index == 26) return vec2(-w-s,vy-s);
    if(index == 27) return vec2(-w,vy-s);

    return vec2(-w,vy);
}


vec2 getSteppedCross(float t)
{
    float segmentValue =
        t*28.0;

    int segment =
        int(
            floor(segmentValue)
        );

    if(segment >= 28)
    {
        segment = 27;
    }

    float localT =
        fract(segmentValue);

    vec2 a =
        steppedCrossVertex(
            segment,
            mat_crossHorizontal,
            mat_crossVertical,
            mat_crossWidth,
            mat_crossStep
        );

    vec2 b =
        steppedCrossVertex(
            (segment+1)%28,
            mat_crossHorizontal,
            mat_crossVertical,
            mat_crossWidth,
            mat_crossStep
        );

    return
        linePoint(
            a,
            b,
            localT
        );
}


/* =========================================================
   DOUBLE CROSS

   Two complete right-angle crosses overlap.
   ========================================================= */

vec2 getDoubleCross(float t)
{
    if(t < 0.5)
    {
        float u =
            t*2.0;

        return
            getGreekCross(
                u,
                mat_crossHorizontal,
                mat_crossVertical,
                mat_crossWidth
            );
    }

    float u =
        (t-0.5)*2.0;

    vec2 p =
        getGreekCross(
            u,
            mat_crossHorizontal,
            mat_crossVertical,
            mat_crossWidth
        );

    p =
        rotate2D(
            p,
            PI*0.5
        );

    p *=
        1.0 -
        mat_crossDoubleOffset*0.35;

    return p;
}


vec2 getCrossShape(float t)
{
    float horizontalLength =
        mat_crossHorizontal;

    float verticalLength =
        mat_crossVertical;

    float width =
        mat_crossWidth;


    if(mat_crossType == 0)
    {
        return
            getGreekCross(
                t,
                horizontalLength,
                verticalLength,
                width
            );
    }


    if(mat_crossType == 1)
    {
        return
            getGreekCross(
                t,
                horizontalLength*0.72,
                verticalLength,
                width
            );
    }


    if(mat_crossType == 2)
    {
        return
            getGreekCross(
                t,
                horizontalLength,
                verticalLength*0.72,
                width
            );
    }


    if(mat_crossType == 3)
    {
        return
            getSteppedCross(t);
    }


    return
        getDoubleCross(t);
}


/* =========================================================
   SIMPLE CENTER-CROSSING FLOWERS

   Every petal starts at the center,
   travels to its tip,
   then returns to the center.

   Therefore all petals cross through the same central point.
   ========================================================= */

vec2 getFlowerShape(float t)
{
    int petals =
        clamp(
            mat_flowerPetals,
            3,
            12
        );

    float total =
        t *
        float(petals);

    int petalIndex =
        int(
            floor(total)
        );

    if(petalIndex >= petals)
    {
        petalIndex =
            petals-1;
    }

    float petalT =
        fract(total);


    float angle =
        TWO_PI *
        float(petalIndex) /
        float(petals);


    angle +=
        mat_flowerTwist *
        sin(
            TWO_PI *
            float(petalIndex) /
            float(petals)
        );


    float alternating =
        mod(
            float(petalIndex),
            2.0
        );


    float length =
        mat_flowerLength *
        (
            1.0 -
            mat_flowerAlternate *
            alternating
        );


    vec2 direction =
        vec2(
            cos(angle),
            sin(angle)
        );


    vec2 perpendicular =
        vec2(
            -direction.y,
            direction.x
        );


    vec2 center =
        vec2(0.0);


    vec2 tip =
        direction *
        length;


    float width =
        mat_flowerWidth *
        length;


    if(petalT < 0.5)
    {
        float u =
            petalT*2.0;

        vec2 control =
            direction *
            length*0.52 +
            perpendicular *
            width;

        return
            quadraticBezier(
                center,
                control,
                tip,
                u
            );
    }


    float u =
        (petalT-0.5)*2.0;

    vec2 control =
        direction *
        length*0.52 -
        perpendicular *
        width;

    return
        quadraticBezier(
            tip,
            control,
            center,
            u
        );
}


/* =========================================================
   FIGURE SELECT
   ========================================================= */

vec2 getFigure(float t)
{
    if(mat_family == 0)
    {
        return
            getOrganicShape(t);
    }


    if(mat_family == 1)
    {
        return
            getCrossShape(t);
    }


    if(mat_family == 2)
    {
        return
            getFlowerShape(t);
    }


    return
        getOrganicShape(t);
}


/* =========================================================
   MOTION
   ========================================================= */

float getMotionProgress()
{
    float duration =
        max(
            mat_duration,
            0.001
        );


    float p =
        fract(
            mat_time /
            duration
        );


    float eased =
        mix(
            p,
            smoother(p),
            mat_easeStrength
        );


    float springEnvelope =
        sin(
            p*PI
        );


    float spring =
        sin(
            p *
            PI *
            mat_elasticFrequency
        );


    spring *=
        exp(
            -p *
            mat_elasticDamping
        );


    spring *=
        springEnvelope;


    return
        eased +
        mat_elasticAmount *
        0.18 *
        spring;
}


/* =========================================================
   TRIM
   ========================================================= */

float trimMask(
    float t,
    float startValue,
    float endValue
)
{
    float softness =
        max(
            mat_trimSoftness,
            0.0001
        );


    float width =
        endValue -
        startValue;


    if(abs(width) >= 0.999)
    {
        return 1.0;
    }


    float s =
        fract(
            startValue +
            1.0
        );


    float e =
        fract(
            endValue +
            1.0
        );


    float value =
        fract(
            t +
            1.0
        );


    if(s <= e)
    {
        float fadeStart =
            smoothstep(
                s-softness,
                s+softness,
                value
            );


        float fadeEnd =
            1.0 -
            smoothstep(
                e-softness,
                e+softness,
                value
            );


        return
            fadeStart *
            fadeEnd;
    }


    float highPart =
        smoothstep(
            s-softness,
            s+softness,
            value
        );


    float lowPart =
        1.0 -
        smoothstep(
            e-softness,
            e+softness,
            value
        );


    return
        max(
            highPart,
            lowPart
        );
}


/* =========================================================
   LASER
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
    int figureIndex =
        pointNumber /
        POINTS_PER_FIGURE;


    int localPoint =
        pointNumber -
        figureIndex *
        POINTS_PER_FIGURE;


    int figureCount =
        clamp(
            mat_figureCount,
            1,
            MAX_FIGURES
        );


    if(figureIndex >= figureCount)
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


    float t =
        float(localPoint) /
        float(
            POINTS_PER_FIGURE-1
        );


    float motion =
        getMotionProgress();


    float animatedOffset =
        mat_offset +
        motion *
        float(
            mat_autoTravelLoops
        );


    animatedOffset +=
        float(figureIndex) *
        mat_layerTrimPhase;


    vec2 p =
        getFigure(t);


    float layerScale =
        max(
            0.05,
            1.0 +
            float(figureIndex) *
            mat_layerScaleStep
        );


    p *=
        mat_size *
        layerScale;


    p *=
        vec2(
            mat_scaleX,
            mat_scaleY
        );


    float rotation =
        radians(
            mat_rotation +
            float(figureIndex) *
            mat_layerRotation
        );


    p =
        rotate2D(
            p,
            rotation
        );


    pos = p;


    float trimT =
        fract(
            t -
            animatedOffset +
            20.0
        );


    float brightness =
        trimMask(
            trimT,
            mat_start,
            mat_end
        );


    brightness *=
        mat_brightness;


    vec3 pointColor =
        mat_colorMode == 1 && t >= 0.5
            ? mat_color2.rgb
            : mat_color.rgb;


    color =
        vec4(
            pointColor *
            brightness,
            1.0
        );


    shapeNumber =
        figureIndex;


    userData =
        vec4(
            t,
            motion,
            float(mat_family)/3.0,
            brightness
        );
}