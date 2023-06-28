use spacetimedb::{spacetimedb, Identity, SpacetimeType, Timestamp};

#[spacetimedb(table)]
#[derive(Debug, Clone)]
pub struct Globals {
    #[primarykey]
    pub id: u32,

    pub spawnable_entity_id_counter: u64,
}

#[spacetimedb(table)]
#[derive(Clone)]
pub struct Location {
    #[primarykey]
    #[autoinc]
    pub spawnable_entity_id: u64,

    pub room_id: Option<String>,
    pub last_room_id: Option<String>,
}

#[spacetimedb(table)]
pub struct Mobile {
    #[primarykey]
    pub spawnable_entity_id: u64,

    pub name: String,
    pub description: String,
}

#[spacetimedb(table)]
pub struct Player {
    #[primarykey]
    pub spawnable_entity_id: u64,
    #[unique]
    pub identity: Identity,
}

#[derive(Clone)]
#[spacetimedb(table)]
pub struct Room {
    #[primarykey]
    pub room_id: String,

    pub zone_id: String,

    pub name: String,
    pub description: String,
    pub exits: Vec<Exit>,
}

#[derive(Clone)]
#[spacetimedb(table)]
pub struct World {
    #[primarykey]
    pub world_id: String,

    pub name: String,
    pub description: String,
}

#[derive(Clone)]
#[spacetimedb(table)]
pub struct Zone {
    #[primarykey]
    pub zone_id: String,

    pub world_id: String,

    pub name: String,
    pub description: String,
    pub connecting_zones: Vec<String>,
}

#[spacetimedb(table)]
pub struct RoomChat {
    #[primarykey]
    #[autoinc]
    pub chat_entity_id: u64,

    pub room_id: String,
    pub source_spawnable_entity_id: u64,
    pub chat_text: String,
    pub timestamp: Timestamp,
}

#[spacetimedb(table)]
pub struct DirectMessage {
    #[primarykey]
    #[autoinc]
    pub whisper_entity_id: u64,

    pub source_spawnable_entity_id: u64,
    pub target_spawnable_entity_id: u64,
    pub chat_text: String,
    pub timestamp: Timestamp,
}

#[derive(SpacetimeType, Clone)]
pub struct Exit {
    pub direction: String,
    pub examine: String,
    pub destination_room_id: String,
}
