// lib/models/route.ts
export interface StatusModel {
    id: number;
    code: string;
    label: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface EntityModel {
    id: number;
    code: string;
    name: string;
    email: string;
    telephone: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface CityModel {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface RiskTypeModel {
    id: number;
    code: string;
    label: string;
    description: string;
    is_primary: number;
    precaution: string;
    speed: string;
    consequence: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

export interface RoutePointModel {
    id: number;
    label: string;
    longitude: string;
    latitude: string;
    distance: string;
    photo: string;
    status: StatusModel;
    riskType: RiskTypeModel;
    entity: EntityModel;
    city: CityModel;
    created_at: string;
    updated_at: string;
}

export interface RouteModel {
    id: number;
    uuid: string;
    label: string;
    description: string;
    state: number;
    starting_point: string;
    end_point: string;
    resting_place: string;
    other_recommendation: string;
    after_trip_observation: string;
    departure_city_id: number;
    destination_city_id: number;
    entity_id: number;
    status_id: number;
    created_by: number;
    created_at: string;
    updated_by: number;
    updated_at: string;
    deleted_by?: number | null;
    deleted_at?: string | null;
    departure_city: string;
    destination_city: string;
}

export interface LocationPoint {
    lat?: number;
    lng?: number;
    icon?: string;
    photo?: string;
    risk_label?: string;
    risk_type_label?: string;
    risk_type_precaution?: string;
    risk_type_speed?: string;
    risk_type_consequence?: string;
}

export interface RiskPoint {
    risk_type_id?: number;
    risk_type_label?: string;
    risk_type_icon?: string;
    risk_type_speed?: string;
    risk_id?: number;
    risk_label?: string;
    risk_photo?: string;
    count?: number;
}

export interface RouteInfo {
    id?: number;
    uuid?: string;
    label?: string;
    description?: string;
    state?: number;
    starting_point?: string;
    end_point?: string;
    resting_place?: string;
    other_recommendation?: string;
    after_trip_observation?: string;
    departure_city_id?: number;
    destination_city_id?: number;
    entity_id?: number;
    status_id?: number;
    created_by?: number;
    created_at?: string;
    updated_by?: number;
    updated_at?: string;
    deleted_by?: any;
    deleted_at?: any;
    recommendation?: any[];
}

export interface MaxRiskType {
    id?: number;
    uuid?: string;
    order?: number;
    state?: number;
    section_id?: number;
    risk_id?: number;
    entity_id?: number;
    status_id?: number;
    created_by?: number;
    created_at?: string;
    updated_by?: number;
    updated_at?: string;
    deleted_by?: any;
    deleted_at?: any;
    risk_label?: string;
    p?: string;
    risk_longitude?: string;
    risk_photo?: string;
    risk_type_id?: number;
    risk_type_label?: string;
    risk_type_icon?: string;
    risk_type_precaution?: string;
    risk_type_speed?: string;
    risk_type_consequence?: string;
}

export interface DisplayRouteResponse {
    status?: boolean;
    message?: string;
    locations?: LocationPoint[];
    risks?: RiskPoint[];
    route?: RouteInfo;
    count?: number;
    max_risk_types?: MaxRiskType[];
    max_precaution?: string;
    max_speed?: string;
    max_consequence?: string;
}

// {
//     "id": 1,
//     "uuid": "e12a0680-d34a-4878-8ee2-6ff93c461b9d",
//     "label": "NDJOLE - LOPE",
//     "description": "NDJOLE - LOPE",
//     "state": 1,
//     "starting_point": "Entr\u00e9e de Zone Urbaine NDJOLE 12.59194953 -0.96438898",
//     "end_point": null,
//     "resting_place": null,
//     "other_recommendation": null,
//     "after_trip_observation": null,
//     "departure_city_id": 7,
//     "destination_city_id": 5,
//     "entity_id": 3,
//     "status_id": 1,
//     "created_by": 1,
//     "created_at": "2025-03-20T15:57:16.000000Z",
//     "updated_by": 1,
//     "updated_at": "2025-03-20T15:58:18.000000Z",
//     "deleted_by": null,
//     "deleted_at": null,
//     "departure_city": "NDJOLE",
//     "destination_city": "LOPE"
// },
