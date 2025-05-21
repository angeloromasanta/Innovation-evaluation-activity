// config.ts
import { GameConfig } from './types';

export const gameConfig: GameConfig = {
  rounds: [
    {
      drugName: 'NVX-001',
      drugDescription: 'Novel small molecule for neuroinflammation, ready for Phase I trials.',
      consultants: [20, 30, 40, 50, 60],
      consultantComments: [
        "(20%) Preclinical toxicology raises red flags; significant off-target effects observed. High risk.",
        "(30%) The mechanism of action is scientifically sound, but early data shows poor bioavailability. Needs major reformulation.",
        "(40%) Animal models show some efficacy, but manufacturing scale-up presents serious challenges.",
        "(50%) Strong in-vitro activity against the target. Phase I human safety data will be the real test.",
        "(60%) Targets a high unmet medical need with an innovative approach. Good potential if early safety is demonstrated."
      ],
      profit: 1200000, // Potential increase in valuation if Phase I is successful
      consultantCost: 50000,  // Cost per expert opinion
      investmentAmount: 3000000, // Cost to run Phase I trial
    },
    {
      drugName: 'ONC-207',
      drugDescription: 'CAR-T cell therapy for a rare leukemia, entering Phase II efficacy studies.',
      consultants: [50, 60, 70, 80, 85],
      consultantComments: [
        "(50%) Phase I showed manageable side effects, but the efficacy signal needs to be much stronger in Phase II to be competitive.",
        "(60%) Patient enrollment for Phase II is progressing. A robust biomarker strategy is crucial for success.",
        "(70%) The competitive landscape is heating up, but our specific antigen target offers a potential differentiation.",
        "(80%) Impressive durability of response in a subset of Phase I patients. Manufacturing consistency is improving.",
        "(85%) This could be a breakthrough for this patient population. Fast-track designation seems achievable."
      ],
      profit: 2500000,
      consultantCost: 75000,
      investmentAmount: 5000000,
    },
    {
      drugName: 'IMD-334',
      drugDescription: 'Antibody-Drug Conjugate (ADC) for autoimmune disease, Phase I ready.',
      consultants: [15, 25, 35, 45, 50],
      consultantComments: [
        "(15%) ADC stability in vivo is a major concern. Significant risk of premature payload release and toxicity.",
        "(25%) The linker technology is novel but unproven for this specific application. Potential for high off-target toxicity.",
        "(35%) Target antigen expression is highly variable in the patient population. Precise patient selection will be critical and difficult.",
        "(45%) Preclinical efficacy is only moderate. A narrow therapeutic window is anticipated.",
        "(50%) Novel mechanism for autoimmune conditions, but faces a high bar for safety and efficacy in a crowded field."
      ],
      profit: 1000000,
      consultantCost: 60000,
      investmentAmount: 2000000,
    },
    {
      drugName: 'CVX-109',
      drugDescription: 'Gene therapy for hereditary cardiomyopathy, late preclinical stage.',
      consultants: [10, 20, 25, 30, 40],
      consultantComments: [
        "(10%) Observed immunogenicity to the delivery vector is a likely showstopper. Extremely high risk.",
        "(20%) Concerns about long-term expression durability and potential for off-target gene editing effects.",
        "(25%) Manufacturing gene therapies at a commercial scale is notoriously complex and prohibitively expensive.",
        "(30%) Animal models show some promise, but translation to human efficacy and safety is a monumental leap.",
        "(40%) Potentially curative if successful, but the technological, manufacturing, and regulatory hurdles are immense."
      ],
      profit: 3000000, // Higher potential due to curative nature if it ever works
      consultantCost: 100000,
      investmentAmount: 4000000,
    },
    {
      drugName: 'INF-502',
      drugDescription: 'Broad-spectrum antiviral, Phase I ready, targeting pandemic preparedness.',
      consultants: [40, 55, 65, 75, 90],
      consultantComments: [
        "(40%) Risk of rapid resistance development is a key concern. Spectrum needs validation against newly emerging viral strains.",
        "(55%) Promising in-vitro activity across multiple viruses, but in-vivo efficacy and PK/PD profile still need to be established.",
        "(65%) Initial safety profile in GLP toxicology studies looks clean. Awaiting full data package.",
        "(75%) The drug's mechanism of action appears robust against common viral escape mutations. Strong government interest.",
        "(90%) High potential for government stockpiling and emergency use authorization. Favorable regulatory outlook if Phase I data is positive."
      ],
      profit: 1800000,
      consultantCost: 40000,
      investmentAmount: 2500000,
    },
  ],
};