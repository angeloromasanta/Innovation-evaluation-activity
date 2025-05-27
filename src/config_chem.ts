// config.ts
import { GameConfig } from './types'; // Assuming types.ts defines GameConfig and a Round type with these new field names

export const gameConfig: GameConfig = {
  rounds: [
    {
       drugName: 'CatSynth-X100',
      drugDescription: 'A novel heterogeneous catalyst for a greener ammonia synthesis process. Investment needed for pilot-scale reactor design and testing.',
      consultants: [20, 30, 40, 50, 60], // Gradual increase in optimism
      consultantComments: [
        "(20%) Initial material characterization (XRD) shows poor active site dispersion and low surface area. High risk of low catalytic activity and selectivity.",
        "(30%) Preliminary kinetic studies in a batch reactor indicate modest conversion rates but rapid catalyst deactivation under process conditions.",
        "(40%) Computational modeling (DFT) supports the proposed catalytic mechanism on an idealized surface, but highlights potential poisoning by common feedstock impurities.",
        "(50%) Bench-scale flow reactor tests demonstrate sustained, but not breakthrough yield. The catalyst appears robust for initial pilot.",
        "(60%) A techno-economic assessment suggests significant operational cost savings over current industrial processes if target conversion is met."
      ],
      profit: 500000,
      consultantCost: 20000,
      investmentAmount: 200000,
    },
    {
       drugName: 'PhotoVoltex-AI',
      drugDescription: 'A new organic semiconductor material, identified via AI-driven computational screening, for next-generation flexible solar panels. Funding for scale-up.',
      consultants: [90, 60, 10,10, 10], // Looks great superficially, deep dives reveal flaws
      consultantComments: [
        "(90%) In-silico predictions boast exceptional theoretical charge mobility and ideal bandgap alignment for solar spectrum absorption.",
        "(60%) Lab-scale spin-coated thin films show promising power conversion efficiency (PCE) under simulated AM1.5G illumination.",
        "(10%) Accelerated degradation testing (UV exposure, humidity) reveals extremely poor photostability, with >50% PCE loss in under 100 hours.",
        "(10%) The synthetic route shows reliance on expensive, supply-chain-critical precursors and low  yield, making commercial scale-up economically unviable.",
        "(10%) Transient absorption spectroscopy indicate dominant exciton recombination pathways, fundamentally limiting quantum efficiency and device lifetime."
      ],
      profit: 500000,
      consultantCost: 20000,
      investmentAmount: 200000,
    },
    {
       drugName: 'PureChem-Extract',
      drugDescription: 'Repurposing an existing industrial solvent for a novel, highly selective extraction process for purifying fine chemicals. Funding for process optimization.',
      consultants: [5, 5, 90, 90, 95], // Skepticism from generalists, optimism from specialists
      consultantComments: [
        "(5%) Standard solubility parameter models (e.g., Hansen) predict poor selectivity in the presence of  similar impurities.",
        "(5%) A review of this solvent class indicates issues with emulsion formation and difficult phase separation.",
        "(90%) Our specialized lab trials with a novel phase transfer co-agent demonstrate high distribution coefficients and >99% purity of the target.",
        "(90%) Engineering confirms the viability of the modified solvent system and outlines a clear path for scale-up.",
        "(95%) Economic modeling based on improved yield shows a potential 30% reduction in manufacturing cost for the target fine chemical."
      ],
      profit: 500000,
      consultantCost: 20000,
      investmentAmount: 200000,
    },
    {
       drugName: 'BioPolymer-EcoWrap',
      drugDescription: 'A new biodegradable polymer synthesized from renewable resources. Funding for pilot-scale production and regulatory compliance.',
      consultants: [50, 50, 40, 0, 0], // Initial optimism erodes
      consultantComments: [
        "(50%) Lab-cast films exhibit tensile strength and flexibility comparable to conventional packaging plastics.",
        "(50%) Initial polymerization trials show good conversion and molecular weight control.",
        "(40%) Pilot-scale polymerization runs are encountering issues with thermal degradation during melt processing, leading to inconsistent material properties.",
        "(0%) LCA reveals that the energy requirements for monomer purification and polymerization are significantly higher than for incumbent fossil-based polymers, negating environmental benefits.",
        "(0%) Leachate testing of the biodegraded polymer has identified trace amounts of a persistent and bioaccumulative byproduct, posing a significant regulatory hurdle."
      ],
      profit: 500000,
      consultantCost: 20000,
      investmentAmount: 200000,
    },
    {
       drugName: 'AquaPure-Catalyst',
      drugDescription: 'A cutting-edge photocatalytic system for complete degradation of persistent organic pollutants (POPs) in industrial wastewater. Funding for field trials.',
      consultants: [10, 95, 95, 95, 95], // One critical flaw, others highly optimistic
      consultantComments: [
        "(10%) Long-term stability tests reveal significant leaching of the active metal component from the catalyst support into the treated water.",
        "(95%) Bench-scale experiments show >99.9% degradation of target POPs (e.g., PFAS, pesticides) within a 2-hour treatment cycle under UV-A irradiation.",
        "(95%) The catalyst synthesis uses low-cost, earth-abundant materials and a scalable sol-gel preparation method.",
        "(95%) Consultation with environmental engineers indicates a pressing need for effective POP remediation technologies.",
        "(95%) Preliminary designs for a continuous flow photoreactor system suggest high throughput and energy efficiency."
      ],
      profit: 500000,
      consultantCost: 20000,
      investmentAmount: 200000,
    },
  ],
};
