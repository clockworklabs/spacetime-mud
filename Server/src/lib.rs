pub mod tables;

use std::time::Duration;

use log;
use spacetimedb::{schedule, spacetimedb, ReducerContext};
use tables::{DirectMessage, Exit, Location, Mobile, Player, Room, RoomChat, World, Zone};

#[spacetimedb(init)]
pub fn initialize() {
    World::insert(World {
        world_id: "nexus".into(),
        name: "Nexus".into(),
        description:
            "The Nexus is the central hub connecting all the worlds that have been created.".into(),
    })
    .unwrap();

    Zone::insert(Zone {
        zone_id: "nexus".into(),
        world_id: "nexus".into(),
        name: "Nexus".into(),
        description: "The nexus zone.".into(),
        connecting_zones: Vec::new(),
    })
    .unwrap();
}

#[spacetimedb(connect)]
pub fn connect(ctx: ReducerContext) {
    if let Some(player) = Player::filter_by_identity(&ctx.sender) {
        schedule!(Duration::ZERO, sign_in(_, player.spawnable_entity_id));
    }
}

#[spacetimedb(disconnect)]
pub fn disconnect(ctx: ReducerContext) {
    if let Some(player) = Player::filter_by_identity(&ctx.sender) {
        schedule!(Duration::ZERO, sign_out(_, player.spawnable_entity_id));
    }
}

#[spacetimedb(reducer)]
pub fn sign_in(_ctx: ReducerContext, player_spawnable_entity_id: u32) -> Result<(), String> {
    let mut location = Location::filter_by_spawnable_entity_id(&player_spawnable_entity_id)
        .unwrap()
        .clone();
    if location.last_room_id.is_some() {
        location.room_id = location.last_room_id.clone();
    } else {
        location.room_id = Some("start".into());
    }
    location.last_room_id = None;
    Location::update_by_spawnable_entity_id(&player_spawnable_entity_id, location);

    Ok(())
}

#[spacetimedb(reducer)]
pub fn sign_out(_ctx: ReducerContext, player_spawnable_entity_id: u32) -> Result<(), String> {
    let mut location = Location::filter_by_spawnable_entity_id(&player_spawnable_entity_id)
        .unwrap()
        .clone();
    location.last_room_id = location.room_id.clone();
    location.room_id = None;
    Location::update_by_spawnable_entity_id(&player_spawnable_entity_id, location);

    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_player(ctx: ReducerContext, name: String, description: String) -> Result<(), String> {
    if Player::filter_by_identity(&ctx.sender).is_some() {
        return Err("Player already exists".into());
    }

    let result = Location::insert(Location {
        spawnable_entity_id: 0,
        room_id: Some("start".into()),
        last_room_id: None,
    })
    .unwrap();

    let spawnable_entity_id = result.spawnable_entity_id;

    Mobile::insert(Mobile {
        spawnable_entity_id: spawnable_entity_id,
        name,
        description,
    })
    .unwrap();
    Player::insert(Player {
        spawnable_entity_id: spawnable_entity_id,
        identity: ctx.sender,
    })
    .unwrap();

    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_npc(
    _ctx: ReducerContext,
    room_id: String,
    name: String,
    description: String,
) -> Result<(), String> {
    let result = Location::insert(Location {
        spawnable_entity_id: 0,
        room_id: Some(room_id),
        last_room_id: None,
    })
    .unwrap();

    let spawnable_entity_id = result.spawnable_entity_id;
    Mobile::insert(Mobile {
        spawnable_entity_id: spawnable_entity_id,
        name,
        description,
    })
    .unwrap();

    Ok(())
}

#[spacetimedb(reducer)]
pub fn say(
    ctx: ReducerContext,
    source_spawnable_entity_id: u32,
    chat_text: String,
) -> Result<(), String> {
    if let Some(location) = Location::filter_by_spawnable_entity_id(&source_spawnable_entity_id) {
        if location.room_id.is_some() {
            RoomChat::insert(RoomChat {
                chat_entity_id: 0,

                room_id: location.room_id.unwrap(),
                source_spawnable_entity_id,
                chat_text,

                timestamp: ctx.timestamp,
            })
            .unwrap();
        } else {
            return Err("No location found.".into());
        }
    } else {
        return Err("No mobile found.".into());
    }

    Ok(())
}

#[spacetimedb(reducer)]
pub fn tell(
    ctx: ReducerContext,
    source_spawnable_entity_id: u32,
    target_spawnable_entity_id: u32,
    chat_text: String,
) -> Result<(), String> {
    let source_mobile = Mobile::filter_by_spawnable_entity_id(&source_spawnable_entity_id);
    let target_mobile = Mobile::filter_by_spawnable_entity_id(&target_spawnable_entity_id);

    if source_mobile.is_none() || target_mobile.is_none() {
        return Err("Target not found.".into());
    }

    let target_location = Location::filter_by_spawnable_entity_id(&target_spawnable_entity_id);
    if target_location.is_none() || target_location.unwrap().room_id.is_none() {
        return Err("Target not found.".into());
    }

    DirectMessage::insert(DirectMessage {
        whisper_entity_id: 0,

        source_spawnable_entity_id,
        target_spawnable_entity_id,
        chat_text,

        timestamp: ctx.timestamp,
    })
    .unwrap();

    Ok(())
}

#[spacetimedb(reducer)]
pub fn go(
    _ctx: ReducerContext,
    source_spawnable_entity_id: u32,
    exit_direction: String,
) -> Result<(), String> {
    if let Some(location) = Location::filter_by_spawnable_entity_id(&source_spawnable_entity_id) {
        let mut new_location = location.clone();
        if let Some(room_id) = location.room_id.clone() {
            let room = Room::filter_by_room_id(&room_id).unwrap();
            let exit = room.exits.iter().find(|e| e.direction == exit_direction);
            if let Some(exit) = exit {
                new_location.last_room_id = location.room_id.clone();
                new_location.room_id = Some(exit.destination_room_id.clone());
                Location::update_by_spawnable_entity_id(&source_spawnable_entity_id, new_location);
            } else {
                return Err("Invalid exit.".into());
            }
        } else {
            return Err("No location found.".into());
        }
    } else {
        return Err("No mobile found.".into());
    }

    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_world(
    _ctx: ReducerContext,
    world_id: String,
    world_name: String,
    world_description: String,
) -> Result<(), String> {
    if World::filter_by_world_id(&world_id).is_some() {
        return Err("World already exists.".into());
    }

    World::insert(World {
        world_id,
        name: world_name,
        description: world_description,
    })
    .expect("Duplication world_id.");

    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_zone(
    _ctx: ReducerContext,
    zone_id: String,
    world_id: String,
    zone_name: String,
    zone_description: String,
) -> Result<(), String> {
    if Zone::filter_by_zone_id(&zone_id).is_some() {
        return Err("Zone already exists.".into());
    }

    Zone::insert(Zone {
        world_id,
        zone_id,
        name: zone_name,
        description: zone_description,
        connecting_zones: Vec::new(),
    })
    .expect("Duplication zone_id.");

    Ok(())
}

#[spacetimedb(reducer)]
pub fn create_room(
    _ctx: ReducerContext,
    zone_id: String,
    room_id: String,
    name: String,
    description: String,
) -> Result<(), String> {
    if Room::filter_by_room_id(&room_id).is_some() {
        return Err("Room already exists.".into());
    }

    Room::insert(Room {
        room_id,
        zone_id,

        name,
        description,
        exits: Vec::new(),
    })
    .expect("Duplication room_id.");

    Ok(())
}

#[spacetimedb(reducer)]
fn create_connection(
    _ctx: ReducerContext,
    from_room_id: String,
    to_room_id: String,
    from_direction: String,
    to_direction: String,
    from_exit_description: String,
    to_exit_description: String,
) -> Result<(), String> {
    log::info!(
        "create_connection: from_room_id: {}, to_room_id: {}, from_direction: {}, to_direction: {}, from_exit_description: {}, to_exit_description: {}",
        from_room_id,
        to_room_id,
        from_direction,
        to_direction,
        from_exit_description,
        to_exit_description
    );

    let from_room = Room::filter_by_room_id(&from_room_id).expect("From room not found.");
    let mut from_room_updated = from_room.clone();

    let to_room = Room::filter_by_room_id(&to_room_id).expect("To room not found.");

    let is_zone_connection = from_room.zone_id != to_room.zone_id;

    let mut exits = from_room.exits.clone();
    exits.push(Exit {
        direction: from_direction.clone(),
        examine: from_exit_description.clone(),
        destination_room_id: to_room_id.clone(),
    });
    from_room_updated.exits = exits;

    Room::update_by_room_id(&from_room_id, from_room_updated);

    if is_zone_connection {
        let from_zone = Zone::filter_by_zone_id(&from_room.zone_id).expect("From zone not found.");
        if !from_zone.connecting_zones.contains(&to_room.zone_id) {
            let mut from_zone_updated = from_zone.clone();
            let mut connecting_zones_updated = from_zone.connecting_zones.clone();
            connecting_zones_updated.push(to_room.zone_id.clone());
            from_zone_updated.connecting_zones = connecting_zones_updated;
            Zone::update_by_zone_id(&from_room.zone_id, from_zone_updated);
        }
    }

    if to_direction != "" {
        let mut to_room_updated = to_room.clone();

        let mut exits = to_room.exits.clone();
        exits.push(Exit {
            direction: to_direction.clone(),
            examine: to_exit_description.clone(),
            destination_room_id: from_room_id.clone(),
        });
        to_room_updated.exits = exits;

        Room::update_by_room_id(&to_room_id, to_room_updated);

        if is_zone_connection {
            let to_zone = Zone::filter_by_zone_id(&to_room.zone_id).expect("To zone not found.");
            if !to_zone.connecting_zones.contains(&from_room.zone_id) {
                let mut to_zone_updated = to_zone.clone();
                let mut connecting_zones_updated = to_zone.connecting_zones.clone();
                connecting_zones_updated.push(from_room.zone_id.clone());
                to_zone_updated.connecting_zones = connecting_zones_updated;
                Zone::update_by_zone_id(&to_room.zone_id, to_zone_updated);
            }
        }
    }

    log::info!("create_connection: done");

    Ok(())
}
