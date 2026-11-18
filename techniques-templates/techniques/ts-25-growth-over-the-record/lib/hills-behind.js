/* hills-behind · Hills behind — TS-25 Growth over the record · Techniques & Templates · ø co.
   Lifted from techniques/ts-25-growth-over-the-record/study.js by _build/build.mjs — do not edit here. Self-contained: every helper it uses is inlined.
   make(P,u,A) — P: params as plain values (defaults below; override any), u: device px per design unit
   (canvas.width / 1000), A: the helpers, V: variant colors (hex strings) where the signature asks for them.
   Limits: Haze under 25 % brings the back hills to the grass inks and they flatten against the main hill; above 85 % the farthest rows vanish into the sky. */
export const id="hills-behind", name="Hills behind", code="TS-25", entry="ts-25-growth-over-the-record";
export const atoms=["silhouette","aerial-perspective","haze"];
export const spec={
  "id": "hills-behind",
  "short": "HILL",
  "name": "Hills behind",
  "layer": 1,
  "pass": 1,
  "atoms": [
    "silhouette",
    "aerial-perspective",
    "haze"
  ],
  "params": {
    "count": {
      "value": 6,
      "range": [
        0,
        8
      ],
      "step": 1,
      "label": "Hills behind",
      "note": "how many measured hills stand behind the main hill, most prominent first"
    },
    "haze_pct": {
      "value": 62,
      "range": [
        25,
        85
      ],
      "step": 1,
      "unit": "%",
      "label": "Haze",
      "note": "how far the farthest row is mixed toward the haze ink; nearer rows take less"
    },
    "mist": 0.3,
    "mist_from_u": 50,
    "mist_to_u": 140,
    "hills": [
      {
        "id": "R1",
        "depth": 1.15,
        "pts": [
          [
            580,
            232
          ],
          [
            610.5,
            212.1
          ],
          [
            709.5,
            170.3
          ],
          [
            771.2,
            149.1
          ],
          [
            817.5,
            142
          ],
          [
            863.8,
            148.5
          ],
          [
            925.4,
            167.7
          ],
          [
            971.7,
            178.7
          ],
          [
            1040,
            196
          ]
        ]
      },
      {
        "id": "L1",
        "depth": 1,
        "pts": [
          [
            -60,
            282
          ],
          [
            0,
            250
          ],
          [
            61.7,
            225.6
          ],
          [
            123.4,
            197.3
          ],
          [
            200.5,
            180.6
          ],
          [
            277.6,
            194.1
          ],
          [
            354.8,
            212.7
          ],
          [
            417.7,
            234.6
          ],
          [
            488.4,
            263.5
          ],
          [
            560,
            300
          ]
        ]
      },
      {
        "id": "Rm",
        "depth": 0.85,
        "pts": [
          [
            740,
            330
          ],
          [
            784.1,
            302.1
          ],
          [
            835.5,
            273.1
          ],
          [
            886.9,
            260.3
          ],
          [
            931.9,
            253.9
          ],
          [
            976.9,
            244.2
          ],
          [
            1000,
            236
          ],
          [
            1060,
            226
          ]
        ]
      },
      {
        "id": "Lm",
        "depth": 0.72,
        "pts": [
          [
            -60,
            316
          ],
          [
            25.7,
            297.6
          ],
          [
            70.7,
            300.8
          ],
          [
            115.7,
            316.2
          ],
          [
            167.1,
            340.6
          ],
          [
            220,
            372
          ]
        ]
      },
      {
        "id": "R0",
        "depth": 1.2,
        "pts": [
          [
            880,
            210
          ],
          [
            925.4,
            192.8
          ],
          [
            983.3,
            177.4
          ],
          [
            1041.1,
            172.2
          ]
        ]
      },
      {
        "id": "Rl",
        "depth": 0.72,
        "pts": [
          [
            800,
            392
          ],
          [
            854.8,
            359.9
          ],
          [
            912.6,
            324.6
          ],
          [
            964,
            307.2
          ],
          [
            1040,
            302
          ]
        ]
      },
      {
        "id": "X1",
        "depth": 1.3,
        "pts": [
          [
            760,
            186
          ],
          [
            803.3,
            167.1
          ],
          [
            899.7,
            126
          ],
          [
            951.2,
            119.5
          ],
          [
            1040,
            134
          ]
        ]
      },
      {
        "id": "X2",
        "depth": 1.22,
        "pts": [
          [
            -60,
            222
          ],
          [
            38.6,
            192.8
          ],
          [
            102.8,
            168.4
          ],
          [
            154.2,
            160.7
          ],
          [
            231.4,
            172.2
          ],
          [
            295.6,
            192.8
          ],
          [
            360,
            220
          ]
        ]
      }
    ]
  },
  "limits": "Haze under 25 % brings the back hills to the grass inks and they flatten against the main hill; above 85 % the farthest rows vanish into the sky.",
  "implementation": "Each hill is a measured monotone-cubic silhouette, screened from the four darker grass inks, darkened over its first 70 u and mixed toward the haze ink by haze × its depth, plus up to 30 % mist from 50 u to 140 u below its top."
};
export const params={
  "count": 6,
  "haze_pct": 62,
  "mist": 0.3,
  "mist_from_u": 50,
  "mist_to_u": 140,
  "hills": [
    {
      "id": "R1",
      "depth": 1.15,
      "pts": [
        [
          580,
          232
        ],
        [
          610.5,
          212.1
        ],
        [
          709.5,
          170.3
        ],
        [
          771.2,
          149.1
        ],
        [
          817.5,
          142
        ],
        [
          863.8,
          148.5
        ],
        [
          925.4,
          167.7
        ],
        [
          971.7,
          178.7
        ],
        [
          1040,
          196
        ]
      ]
    },
    {
      "id": "L1",
      "depth": 1,
      "pts": [
        [
          -60,
          282
        ],
        [
          0,
          250
        ],
        [
          61.7,
          225.6
        ],
        [
          123.4,
          197.3
        ],
        [
          200.5,
          180.6
        ],
        [
          277.6,
          194.1
        ],
        [
          354.8,
          212.7
        ],
        [
          417.7,
          234.6
        ],
        [
          488.4,
          263.5
        ],
        [
          560,
          300
        ]
      ]
    },
    {
      "id": "Rm",
      "depth": 0.85,
      "pts": [
        [
          740,
          330
        ],
        [
          784.1,
          302.1
        ],
        [
          835.5,
          273.1
        ],
        [
          886.9,
          260.3
        ],
        [
          931.9,
          253.9
        ],
        [
          976.9,
          244.2
        ],
        [
          1000,
          236
        ],
        [
          1060,
          226
        ]
      ]
    },
    {
      "id": "Lm",
      "depth": 0.72,
      "pts": [
        [
          -60,
          316
        ],
        [
          25.7,
          297.6
        ],
        [
          70.7,
          300.8
        ],
        [
          115.7,
          316.2
        ],
        [
          167.1,
          340.6
        ],
        [
          220,
          372
        ]
      ]
    },
    {
      "id": "R0",
      "depth": 1.2,
      "pts": [
        [
          880,
          210
        ],
        [
          925.4,
          192.8
        ],
        [
          983.3,
          177.4
        ],
        [
          1041.1,
          172.2
        ]
      ]
    },
    {
      "id": "Rl",
      "depth": 0.72,
      "pts": [
        [
          800,
          392
        ],
        [
          854.8,
          359.9
        ],
        [
          912.6,
          324.6
        ],
        [
          964,
          307.2
        ],
        [
          1040,
          302
        ]
      ]
    },
    {
      "id": "X1",
      "depth": 1.3,
      "pts": [
        [
          760,
          186
        ],
        [
          803.3,
          167.1
        ],
        [
          899.7,
          126
        ],
        [
          951.2,
          119.5
        ],
        [
          1040,
          134
        ]
      ]
    },
    {
      "id": "X2",
      "depth": 1.22,
      "pts": [
        [
          -60,
          222
        ],
        [
          38.6,
          192.8
        ],
        [
          102.8,
          168.4
        ],
        [
          154.2,
          160.7
        ],
        [
          231.4,
          172.2
        ],
        [
          295.6,
          192.8
        ],
        [
          360,
          220
        ]
      ]
    }
  ]
};
export const A={};
A.sstep=(a,b,x)=>{ const t=A.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
A.clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const make=(P,u,A)=>{ const mono=pts=>{ const n=pts.length, X=pts.map(p=>p[0]), Y=pts.map(p=>p[1]), d=[], m=new Array(n);
        for(let i=0;i<n-1;i++)d[i]=(Y[i+1]-Y[i])/(X[i+1]-X[i]); m[0]=d[0]; m[n-1]=d[n-2]; for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
        return x=>{ if(x<=X[0])return [Y[0]+m[0]*(x-X[0]),m[0]]; if(x>=X[n-1])return [Y[n-1]+m[n-1]*(x-X[n-1]),m[n-1]]; let lo=0, hi=n-1; while(hi-lo>1){ const k=(lo+hi)>>1; if(X[k]>x)hi=k; else lo=k; }
          const h=X[hi]-X[lo], t=(x-X[lo])/h, t2=t*t, t3=t2*t; return [(2*t3-3*t2+1)*Y[lo]+(t3-2*t2+t)*h*m[lo]+(-2*t3+3*t2)*Y[hi]+(t3-t2)*h*m[hi], ((6*t2-6*t)*Y[lo]+(3*t2-4*t+1)*h*m[lo]+(6*t-6*t2)*Y[hi]+(3*t2-2*t)*h*m[hi])/h]; }; };
      const list=P.hills.slice(0,Math.max(0,Math.round(P.count))).map(h=>({ id:h.id, depth:h.depth, f:mono(h.pts), x0:h.pts[0][0], x1:h.pts[h.pts.length-1][0] })).sort((a,b)=>b.depth-a.depth);   /* far first */
      return { list, haze:(depth,d)=>Math.min(0.94,P.haze_pct/100*depth+P.mist*A.sstep(P.mist_from_u,P.mist_to_u,d)) }; };
export default make;
