<script setup lang="ts">
import {type Aircraft} from "@/model/Aircraft";
import {onMounted, ref} from "vue";
import config from "@/config";
import {useStatusService} from "@/composables/useStatusService";
import type {AircraftStatus} from "@/model/AircraftStatus";

const aircrafts = ref<Array<Aircraft>>([])
const statuses = ref<Map<string, AircraftStatus>>(new Map())
const statusService = useStatusService()

async function fetchData() {
  const response = await fetch(config.backendUrl + "/aircrafts")
  aircrafts.value = await response.json()
}

function processStatus(status: AircraftStatus) {
  console.log('Received new status:', status)
  statuses.value.set(status.aircraftId, status)
}

onMounted(async () => {
  await fetchData()
  await statusService.init()
  aircrafts.value.forEach(aircraft => {
    statusService.subscribeToAircraft(aircraft._id, processStatus)
  })
})
</script>

<template>
  <main>
    <h1>Aircrafts</h1>
    <div v-for="aircraft in aircrafts" :key="aircraft.name">
      <h3>{{ aircraft.name }}</h3>
      <p>{{ aircraft.model}}, {{ aircraft.capacity }} seats, {{ aircraft.rangeKm }} km</p>
      <p v-if="statuses.has(aircraft._id)">
        Current location:
        {{ statuses.get(aircraft._id)!.latitude }}
        {{ statuses.get(aircraft._id)!.longitude }}
        ({{ new Date(statuses.get(aircraft._id)!.timestamp).toLocaleString() }})
      </p>
    </div>
    <hr/>
    <button @click="statusService.send('Hi, backend!')">Send test message</button>
  </main>
</template>