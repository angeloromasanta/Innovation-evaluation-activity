// config.ts
import { GameConfig } from './types';

export const gameConfig: GameConfig = {
  rounds: [
    {
      drugName: 'GLP-X01',
      drugDescription: 'A next-generation GLP-1 agonist for Type 2 Diabetes. Investment needed for Phase I.',
      consultants: [20, 30, 40, 50, 60], // Gradual increase in optimism as more comprehensive work is done
      consultantComments: [
        "(20%) Our off-target liability screen confirmed significant binding to several unexpected GPCRs. High risk of unpredictable side effects in Phase I.",
        "(30%) The advanced ADME & preliminary rodent PK study indicates poor oral bioavailability and rapid clearance. Major formulation challenges ahead for human trials.",
        "(40%) Our focused animal efficacy model in diabetic primates showed modest, though statistically significant, glucose lowering, but less impressive than hoped.",
        "(50%) The in-depth mechanism of action elucidation & receptor engagement study strongly validated target binding and downstream signaling. The science is sound if PK/Tox can be managed.",
        "(60%) Our competitive landscape analysis and KOL interviews suggest a high unmet need for its specific proposed profile. Strong potential market."
      ],
      profit: 100000000,      // $100M
      consultantCost: 2000000, // $2M per "work package"
      investmentAmount: 25000000, // $25M for the core Phase I trial itself (if they proceed)
    },
    {
      drugName: 'ONC-207',
      drugDescription: 'A novel kinase inhibitor identified via AI-driven screening, targeting a newly hypothesized pathway in brain tumors. Funding is for stronger basic research.',
      consultants: [90, 80, 10, 20, 10], // Looks great with superficial/optimistic packages, bad with deep dives
      consultantComments: [
        "(90%) Our high-throughput cell line cytotoxicity screenshows nanomolar potency across multiple glioblastoma cell lines.",
        "(80%) The initial target validation using CRISPR knockdowns in vitro confirms the kinase is essential for tumor cell survival.",
        "(10%) Our blood-brain barrier penetrance assessment using in-silico and early rodent models shows virtually zero CNS exposure.",
        "(20%) A deep dive into the target's pathway biology reveals unlikely single-agent inhibition will be effective long-term.",
        "(10%) Our early neurogenicity screen flags critical neural development kinases as potential off-targets. High risk of severe neurotoxicity."
      ],
      profit: 12000000,       // $12M (Low profit to make overall EV negative with full info)
      consultantCost: 500000,   // $500k per "work package"
      investmentAmount: 6000000, // $6M for more extensive preclinical development (if they proceed)
    },
    {
      drugName: 'IMD-334',
      drugDescription: 'An existing anti-inflammatory drug (approved for RA) being explored for a rare autoimmune orphan disease. Funding needed for Phase II.',
      consultants: [10, 10, 80, 90, 90], // Skepticism from generalists, optimism from specialists in the new indication
      consultantComments: [
        "(10%) Our historical data review of this drug class in related autoimmune conditions shows consistent lack of efficacy. ",
        "(10%) Feasibility assessment highlights extreme patient heterogeneity and biomarker challenges for this orphan disease. Trial will be very difficult to interpret.",
        "(80%) Our commissioned study on the drug's mode of action in cellular models shows surprisingly strong immunomodulatory effects.",
        "(90%) The expert panel on orphan disease trial design confirms a clear regulatory path if even modest efficacy is shown, given the unmet need and known safety.",
        "(90%) Our advanced biomarker discovery for patient stratification has identified a promising signature that could significantly enrich for responders."
      ],
      profit: 150000000,     // $150M
      consultantCost: 5000000,  // $5M per "work package" (specialized, costly studies)
      investmentAmount: 50000000, // $50M for the full Phase IIb trial (if they proceed)
    },
    {
      drugName: 'CVX-109',
      drugDescription: 'A cardiovascular drug for heart failure that showed good Phase II efficacy. Funding for critical Phase III.',
      consultants: [50, 50, 40, 0, 0], // Initial optimism erodes as deeper, critical reviews come in
      consultantComments: [
        "(50%) Our review of the Phase II efficacy data and proposed Phase III endpoints suggests a solid foundation.",
        "(50%) Pharmacokinetic/pharmacodynamic modeling supports the proposed dosing regimen for Phase III. Looks reasonable.",
        "(40%) Long-term exposure simulations based on Phase II data,flags a potential for rare but serious liver enzyme elevations.",
        "(0%) Critical review of manufacturing scale-up and COGS indicate the drug will be commercially unviable even if approved due to extreme production costs.",
        "(0%) We identified a fundamental flaw in the biological rationale that was missed, predicting Phase II results were likely anomalous. Doomed."
      ],
      profit: 600000000,     // $600M
      consultantCost: 15000000, // $15M per "work package" (very high-level, critical Phase III reviews)
      investmentAmount: 250000000, // $250M for the full Phase III trial (if they proceed)
    },
    {
      drugName: 'INF-502',
      drugDescription: 'A cutting-edge gene therapy for a rare pediatric genetic disorder. Funding decisions for final studies and advanced manufacturing process validation.',
      consultants: [10, 95, 95, 95, 95], // One critical work package flags a major issue, others highly optimistic
      consultantComments: [
        "(10%) Simulations of long-term genotoxicity work predicts a clinically significant risk of secondary malignancies years post-treatment.",
        "(95%) Preclinical efficacy and safety study in mice shows complete and durable disease correction with no acute toxicity.",
        "(95%) Our CMC scale-up work package confirms a robust, scalable, and high-purity production method.",
        "(95%) Patient advocacy and clinical expert consultation reveals overwhelming support and a strong belief in transformative potential, urging rapid development.",
        "(95%) Assessment indicates a high likelihood of fast-track designation and priority review given the unmet need and profound early data."
      ],
      profit: 300000000,     // $300M
      consultantCost: 20000000, // $20M per "work package" (complex gene therapy studies)
      investmentAmount: 150000000, // $150M for clinical development and manufacturing setup (if they proceed)
    },
  ],
};