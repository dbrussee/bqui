<script setup lang="ts">
</script>

<template>
  <h3>Future home of proposals page</h3>
    A proposal is a PDF packaging up a set of quotes all with the same effective dates
    Each proposal will contain the following:
    <ul>
      <li>A cover page
        <ul>
          <li>Effective Dates for the quotes contained</li>
          <li>Information about the agent</li>
          <li>Information about the prospect</li>
          <li>A version identifier with timestamp</li>
        </ul>
      </li>
      <li>An optional group application</li>
      <li>A set of quote pages. Each set has
        <ul>
          <li>A cover page describing the plans</li>
          <li>Detail quote / plan pages</li>
          <li>Optional rate sheets</li>
        </ul>
      </li>
      <li>Optioonal quote comparison pages</li>
    </ul>
  <h4>Proposal versions</h4>
    Each proposal will have multiple versions over time. Each version will be
    stored as a static PDF file on the server. The latest iteration
    will be able to be downloaded, but older versions will be kept for
    research.
    <p>
    While the quotes themselves cannot change, the rates and census
    data associated with them may. This is the reason why a proposal
    may be "regenerated" and get a new version.
    </p>
</template>

<style lang="css" scoped>
</style>
