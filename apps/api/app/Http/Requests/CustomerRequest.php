<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:15'],
            'address' => ['required', 'string'],
            'birth_date' => ['nullable', 'date'],
            'religion' => ['nullable', 'string', 'in:Islam,Kristen Protestan,Kristen Katolik,Hindu,Buddha,Khonghucu'],
            'gender' => ['nullable', 'in:L,P'],
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $customer = $this->route('customer');
            
            // Allow partial updates
            foreach ($rules as $key => $rule) {
                if (is_array($rule) && in_array('required', $rule)) {
                    array_unshift($rules[$key], 'sometimes');
                }
            }

            $userId = ($customer instanceof \App\Models\Customer) ? $customer->user_id : null;
            $rules['email'] = ['sometimes', 'required', 'string', 'email', 'max:255', 'unique:users,email,' . $userId];
            $rules['password'] = ['nullable', 'string', 'min:8'];
        }

        if ($this->isMethod('POST')) {
            $rules['password'] = ['nullable', 'string', 'min:8'];
        }

        return $rules;
    }
}
