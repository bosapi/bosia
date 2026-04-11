<script lang="ts">
    import {
        Accordion,
        AccordionItem,
        AccordionTrigger,
        AccordionContent,
    } from "$registry/accordion";

    let value = $state<string>("item-1");
</script>

<div class="w-full max-w-md">
    <Accordion type="single" collapsible bind:value>
        <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
                Yes. It follows the WAI-ARIA design pattern and ships with
                full keyboard navigation.
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
                Yes. It comes with default styles that match the other
                components' aesthetic.
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
                The chevron rotates on open. You can layer your own
                height/opacity transitions on top if desired.
            </AccordionContent>
        </AccordionItem>
    </Accordion>
</div>
