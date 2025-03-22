// lib/models/user.ts

export interface StatusModel {
    id: number;
    code: string;
    label: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ProfileModel {
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
// "data": {
//     "user": {
//         "id": 1,
//         "first_name": "ADMIN",
//         "last_name": "SUPER",
//         "name": "ADMIN SUPER",
//         "email": "superadmin@gmail.com",
//         "telephone": "01050635899",
//         "status": {
//             "id": 1,
//             "code": "active",
//             "label": "Actif(ve)",
//             "description": "Actif(ve)",
//             "created_at": "2025-03-16 22:28:02",
//             "updated_at": "2025-03-16 22:28:02"
//         },
//         "profile": {
//             "id": 1,
//             "code": "super_admin",
//             "label": "Super Administrateur - Control Parks",
//             "description": "Super Administrateur - Control Parks",
//             "created_at": "2025-03-16 22:28:02",
//             "updated_at": "2025-03-16 22:28:02"
//         },
//         "entity": {
//             "id": 1,
//             "code": "ENT_001",
//             "name": "Hub Green",
//             "email": "hubgreen@hubgreen.com",
//             "telephone": "01050635899",
//             "address": "123 rue des fleurs",
//             "created_at": "2025-03-16 22:28:02",
//             "updated_at": "2025-03-16 22:28:02"
//         },
//         "created_at": "2025-03-16 22:28:02",
//         "updated_at": "2025-03-16 22:28:02"
//     },
//     "nb_countries": 1,
//     "nb_cities": 56,
//     "nb_entities": 3
// }
export interface UserModel {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        name: string;
        email: string;
        telephone: string;
        status: StatusModel;
        profile: ProfileModel;
        entity: EntityModel;
        created_at: string;
        updated_at: string;
    };
    nb_countries: number;
    nb_cities: number;
    nb_entities: number;
}

export const createEmptyStatus = (): StatusModel => ({
    id: 0,
    code: '',
    label: '',
    description: '',
    created_at: '',
    updated_at: ''
});

export const createEmptyProfile = (): ProfileModel => ({
    id: 0,
    code: '',
    label: '',
    description: '',
    created_at: '',
    updated_at: ''
});

export const createEmptyEntity = (): EntityModel => ({
    id: 0,
    code: '',
    name: '',
    email: '',
    telephone: '',
    address: '',
    created_at: '',
    updated_at: ''
});

export const createEmptyUser = (): UserModel => ({
    user: {
        id: 0,
        first_name: '',
        last_name: '',
        name: '',
        email: '',
        telephone: '',
        status: createEmptyStatus(),
        profile: createEmptyProfile(),
        entity: createEmptyEntity(),
        created_at: '',
        updated_at: ''
    },
    nb_countries: 0,
    nb_cities: 0,
    nb_entities: 0
});

// Response types for authentication
export interface AuthResponse {
    status: number;
    message: string;
    data: {
        token: string;
    };
}

export interface UserResponse {
    status: number;
    message: string;
    data: UserModel;
}

// Login request payload
export interface LoginRequest {
    username: string;
    password: string;
}

// Refresh token request payload
export interface RefreshTokenRequest {
    refreshToken: string;
}
