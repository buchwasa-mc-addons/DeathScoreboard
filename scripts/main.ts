import {
  DisplaySlotId,
  ObjectiveSortOrder,
  Player,
  world,
  system,
} from "@minecraft/server";

const DEATH_PROPERTY = "totalDeaths";
const DEATH_OBJECTIVE = "rp_death_display";

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity instanceof Player) {
    let deathProperty = deadEntity.getDynamicProperty(DEATH_PROPERTY);
    let deathScoreboard = world.scoreboard.getObjective(DEATH_OBJECTIVE);

    if (deathScoreboard === undefined) {
      return;
    }

    deathProperty = typeof deathProperty === "number" ? ++deathProperty : 1;
    deadEntity.setDynamicProperty(DEATH_PROPERTY, deathProperty);
    deathScoreboard.setScore(deadEntity, deathProperty);
  }
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  let deathScoreboard = world.scoreboard.getObjective(DEATH_OBJECTIVE);
  let deathProperty = player.getDynamicProperty(DEATH_PROPERTY);
  if (deathScoreboard === undefined) {
    return;
  }

  deathScoreboard.setScore(player, typeof deathProperty === "number" ? deathProperty : 0);

  world.sendMessage("YAY!");
});

world.beforeEvents.playerLeave.subscribe(({ player }) => {
  let deathScoreboard = world.scoreboard.getObjective(DEATH_OBJECTIVE);
  let playerIdentity = player.scoreboardIdentity;
  if (deathScoreboard === undefined || playerIdentity === undefined) {
    return;
  }

  system.run(() => {
    deathScoreboard.removeParticipant(playerIdentity);
  });
});

world.afterEvents.worldLoad.subscribe(() => {
  let scoreboard = world.scoreboard;
  let deathScoreboard = scoreboard.getObjective(DEATH_OBJECTIVE);
  if (deathScoreboard === undefined) {
    deathScoreboard = scoreboard.addObjective(DEATH_OBJECTIVE, "Deaths");
    scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
      objective: deathScoreboard,
      sortOrder: ObjectiveSortOrder.Descending,
    });
  }
});
